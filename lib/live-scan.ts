/**
 * Live scan: fetches a real URL server-side and evaluates the fifteen checks
 * against real headers, real HTML and real sibling files.
 *
 * Server-only. Never import this from a client component — it pulls in `tls`
 * and `dns`, and it is the half of the engine that is allowed to touch the
 * network. The scoring maths itself lives in `scan-engine.ts` and is shared.
 */

import { promises as dns } from "node:dns";
import tls from "node:tls";

import {
  CHECKS,
  type CheckId,
  type CheckResult,
  type CheckStatus,
  type ScanResult,
  checkDefinition,
  detailFor,
  gradeOf,
  normaliseUrl,
  scoreOf,
} from "./scan-engine";

const FETCH_TIMEOUT_MS = 8_000;
const MAX_HTML_BYTES = 2_000_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; StampGradeBot/1.0; +https://stampgrade.com)";

export class ScanError extends Error {}

/* ------------------------------------------------------------------ */
/* Safety: never let a pasted URL reach the internal network            */
/* ------------------------------------------------------------------ */

function isPrivateAddress(ip: string, family: number): boolean {
  if (family === 6) {
    const v = ip.toLowerCase();
    if (v === "::1" || v === "::") return true;
    if (v.startsWith("fe80") || v.startsWith("fc") || v.startsWith("fd")) return true;
    // IPv4-mapped IPv6 (::ffff:10.0.0.1) — unwrap and re-test.
    const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1], 4);
    return false;
  }

  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a, b] = parts;

  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // link-local + cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  if (a >= 224) return true; // multicast + reserved
  return false;
}

/** Throws if the host resolves anywhere we have no business fetching. */
async function assertPublicHost(hostname: string): Promise<void> {
  let records: { address: string; family: number }[];
  try {
    records = await dns.lookup(hostname, { all: true });
  } catch {
    throw new ScanError("That domain does not resolve.");
  }
  if (records.length === 0) throw new ScanError("That domain does not resolve.");
  if (records.some((r) => isPrivateAddress(r.address, r.family))) {
    throw new ScanError("That address is not publicly reachable.");
  }
}

/* ------------------------------------------------------------------ */
/* Fetch helpers                                                       */
/* ------------------------------------------------------------------ */

async function fetchText(
  url: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; text: string; headers: Headers; finalUrl: string }> {
  const res = await fetch(url, {
    ...init,
    redirect: "follow",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { "user-agent": USER_AGENT, accept: "*/*", ...(init?.headers ?? {}) },
    cache: "no-store",
  });

  const declared = Number(res.headers.get("content-length") ?? "0");
  if (declared > MAX_HTML_BYTES) {
    return { ok: res.ok, status: res.status, text: "", headers: res.headers, finalUrl: res.url };
  }

  const raw = await res.text();
  return {
    ok: res.ok,
    status: res.status,
    text: raw.length > MAX_HTML_BYTES ? raw.slice(0, MAX_HTML_BYTES) : raw,
    headers: res.headers,
    finalUrl: res.url || url,
  };
}

/** Best-effort sibling fetch — a miss is a signal, not an error. */
async function fetchSibling(origin: string, path: string): Promise<string | null> {
  try {
    const res = await fetchText(new URL(path, origin).toString());
    if (!res.ok || !res.text.trim()) return null;
    return res.text;
  } catch {
    return null;
  }
}

/**
 * Days until the TLS certificate expires. `null` when we could not read it —
 * treated as "unknown", which does not fail the check on its own.
 */
function certificateDaysRemaining(hostname: string): Promise<number | null> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (value: number | null) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    };

    const socket = tls.connect(
      { host: hostname, port: 443, servername: hostname, timeout: 5_000 },
      () => {
        const cert = socket.getPeerCertificate();
        if (!cert || !cert.valid_to) return done(null);
        const expiry = new Date(cert.valid_to).getTime();
        if (Number.isNaN(expiry)) return done(null);
        done(Math.floor((expiry - Date.now()) / 86_400_000));
      },
    );

    socket.on("error", () => done(null));
    socket.on("timeout", () => done(null));
  });
}

/* ------------------------------------------------------------------ */
/* HTML probes (regex, not a parser — we only need presence and length) */
/* ------------------------------------------------------------------ */

function metaContent(html: string, attr: "name" | "property", key: string): string | null {
  const pattern = new RegExp(
    `<meta[^>]*${attr}\\s*=\\s*["']${key}["'][^>]*>`,
    "i",
  );
  const tag = html.match(pattern)?.[0];
  if (!tag) return null;
  return tag.match(/content\s*=\s*["']([^"']*)["']/i)?.[1]?.trim() ?? null;
}

function linkWithRel(html: string, relPattern: RegExp): string | null {
  const links = html.match(/<link[^>]*>/gi) ?? [];
  for (const tag of links) {
    const rel = tag.match(/rel\s*=\s*["']([^"']*)["']/i)?.[1];
    if (rel && relPattern.test(rel)) {
      return tag.match(/href\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    }
  }
  return null;
}

function stripNonContent(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

/* ------------------------------------------------------------------ */
/* The scan                                                            */
/* ------------------------------------------------------------------ */

export async function liveScan(input: string): Promise<ScanResult> {
  const normalised = normaliseUrl(input);
  if (!normalised) throw new ScanError("That does not look like a valid URL.");

  const target = new URL(normalised.url);
  await assertPublicHost(target.hostname);

  let page: Awaited<ReturnType<typeof fetchText>>;
  try {
    page = await fetchText(target.toString(), { headers: { accept: "text/html,*/*" } });
  } catch {
    throw new ScanError("We could not reach that site.");
  }
  if (!page.ok) throw new ScanError(`That site answered with ${page.status}.`);

  const finalUrl = new URL(page.finalUrl);
  const origin = finalUrl.origin;
  const html = stripNonContent(page.text);
  const headers = page.headers;

  const [robots, sitemapDirect, llms, faviconDirect, certDays] = await Promise.all([
    fetchSibling(origin, "/robots.txt"),
    fetchSibling(origin, "/sitemap.xml"),
    fetchSibling(origin, "/llms.txt"),
    fetchSibling(origin, "/favicon.ico"),
    finalUrl.protocol === "https:" ? certificateDaysRemaining(finalUrl.hostname) : Promise.resolve(null),
  ]);

  const verdicts: Record<CheckId, { status: CheckStatus; detail?: string }> = {
    HTTPS: (() => {
      const secure = finalUrl.protocol === "https:";
      return {
        status: secure ? "pass" : "fail",
        detail: secure
          ? "Served over HTTPS."
          : "Resolves to plain http — traffic is unencrypted.",
      };
    })(),

    SSL_EXPIRY: (() => {
      if (finalUrl.protocol !== "https:") {
        return { status: "fail" as const, detail: "No certificate — the site is not on HTTPS." };
      }
      if (certDays === null) {
        // The TLS handshake already succeeded via HTTPS, so the cert is valid
        // today; we simply could not read its expiry.
        return { status: "pass" as const, detail: "Certificate is valid; expiry could not be read." };
      }
      if (certDays < 0) return { status: "fail" as const, detail: "Certificate has expired." };
      if (certDays < 30) {
        return { status: "fail" as const, detail: `Certificate lapses in ${certDays} days.` };
      }
      return { status: "pass" as const, detail: `Certificate valid for another ${certDays} days.` };
    })(),

    SECURITY_HEADERS: (() => {
      const present = [
        headers.get("strict-transport-security") && "HSTS",
        headers.get("content-security-policy") && "CSP",
        headers.get("x-frame-options") && "X-Frame-Options",
      ].filter(Boolean) as string[];
      return present.length >= 2
        ? { status: "pass", detail: `${present.join(", ")} present.` }
        : {
            status: "fail",
            detail: present.length
              ? `Only ${present.join(", ")} present.`
              : "No HSTS, CSP or X-Frame-Options header.",
          };
    })(),

    TITLE_TAG: (() => {
      const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
      if (!title) return { status: "fail" as const, detail: "No title tag." };
      if (title.length > 60) {
        return { status: "fail" as const, detail: `Title is ${title.length} chars — truncated in results.` };
      }
      return { status: "pass" as const, detail: `Title is ${title.length} chars.` };
    })(),

    META_DESCRIPTION: (() => {
      const desc = metaContent(html, "name", "description");
      if (!desc) return { status: "fail" as const, detail: "No meta description — Google will invent one." };
      if (desc.length < 50 || desc.length > 160) {
        return { status: "fail" as const, detail: `Description is ${desc.length} chars — outside the shown range.` };
      }
      return { status: "pass" as const, detail: `Description is ${desc.length} chars.` };
    })(),

    HEADINGS: (() => {
      const h1s = html.match(/<h1[\s>]/gi)?.length ?? 0;
      if (h1s === 0) return { status: "fail" as const, detail: "No H1 on the page." };
      if (h1s > 1) return { status: "fail" as const, detail: `${h1s} H1 tags — only one should exist.` };
      return { status: "pass" as const, detail: "Exactly one H1." };
    })(),

    CANONICAL: (() => {
      const href = linkWithRel(html, /\bcanonical\b/i);
      return href
        ? { status: "pass", detail: "Canonical URL declared." }
        : { status: "fail", detail: "No canonical tag — duplicate URLs compete." };
    })(),

    ROBOTS_TXT: robots
      ? { status: "pass", detail: "robots.txt found." }
      : { status: "fail", detail: "No robots.txt — crawlers are guessing." },

    SITEMAP: (() => {
      const referenced = robots ? /^\s*sitemap\s*:/im.test(robots) : false;
      const exists = sitemapDirect !== null && /<(urlset|sitemapindex)/i.test(sitemapDirect);
      if (exists && referenced) return { status: "pass" as const, detail: "Sitemap found and referenced in robots.txt." };
      if (exists) return { status: "fail" as const, detail: "Sitemap exists but robots.txt never points to it." };
      return { status: "fail" as const, detail: "No XML sitemap at the usual locations." };
    })(),

    OG_TAGS: (() => {
      const missing = ["og:title", "og:description", "og:image"].filter(
        (k) => !metaContent(html, "property", k) && !metaContent(html, "name", k),
      );
      return missing.length === 0
        ? { status: "pass", detail: "og:title, og:description and og:image all set." }
        : { status: "fail", detail: `Missing ${missing.join(", ")} — links unfurl as a gray box.` };
    })(),

    TWITTER_CARD: (() => {
      const card = metaContent(html, "name", "twitter:card") ?? metaContent(html, "property", "twitter:card");
      return card
        ? { status: "pass", detail: `twitter:card set to "${card}".` }
        : { status: "fail", detail: "No twitter:card tag — shares render as plain text." };
    })(),

    FAVICON: (() => {
      const declared = linkWithRel(html, /\bicon\b/i);
      if (declared !== null) return { status: "pass" as const, detail: "Favicon declared in the head." };
      if (faviconDirect !== null) return { status: "pass" as const, detail: "favicon.ico served at the root." };
      return { status: "fail" as const, detail: "No favicon — browsers show the default globe." };
    })(),

    VIEWPORT: (() => {
      const viewport = metaContent(html, "name", "viewport");
      if (!viewport) return { status: "fail" as const, detail: "No viewport meta tag — the page cannot adapt to phones." };
      if (!/width\s*=\s*device-width/i.test(viewport)) {
        return { status: "fail" as const, detail: "Viewport does not use width=device-width." };
      }
      return { status: "pass" as const, detail: "Responsive viewport tag present." };
    })(),

    ALT_TEXT: (() => {
      const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
      if (imgs.length === 0) return { status: "pass" as const, detail: "No <img> tags to check." };
      const missing = imgs.filter((tag) => !/\balt\s*=/i.test(tag)).length;
      return missing === 0
        ? { status: "pass" as const, detail: `All ${imgs.length} images carry alt text.` }
        : { status: "fail" as const, detail: `${missing} of ${imgs.length} images have no alt attribute.` };
    })(),

    AI_READINESS: (() => {
      const hasLlms = llms !== null;
      const bots = ["GPTBot", "ClaudeBot", "PerplexityBot"];
      const addressed = robots ? bots.filter((b) => new RegExp(b, "i").test(robots)) : [];
      if (hasLlms && addressed.length > 0) {
        return { status: "pass" as const, detail: `llms.txt present; ${addressed.join(", ")} addressed.` };
      }
      if (hasLlms) return { status: "fail" as const, detail: "llms.txt present but no AI-crawler directives in robots.txt." };
      if (addressed.length > 0) return { status: "fail" as const, detail: `${addressed.join(", ")} addressed but no llms.txt.` };
      return { status: "fail" as const, detail: "No llms.txt and no AI-crawler directives." };
    })(),
  };

  const checks: CheckResult[] = CHECKS.map((def) => {
    const verdict = verdicts[def.id];
    return {
      ...checkDefinition(def.id),
      status: verdict.status,
      detail: verdict.detail ?? detailFor(def.id, verdict.status),
    };
  });

  const score = scoreOf(checks);

  return {
    url: finalUrl.toString(),
    domain: finalUrl.hostname.replace(/^www\./, ""),
    score,
    grade: gradeOf(score),
    checks,
    passed: checks.filter((c) => c.status === "pass").length,
    failed: checks.filter((c) => c.status === "fail").length,
    scannedAt: new Date().toISOString(),
    engine: "live",
  };
}
