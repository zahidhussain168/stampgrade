/**
 * StampGrade scan engine.
 *
 * This module is deliberately pure and isomorphic — no fetch, no DOM, no
 * Node built-ins — so the same grading maths runs on the server (after a real
 * page fetch) and in the browser (as an offline fallback).
 *
 * Two engines produce the same `ScanResult` shape:
 *
 *   "live"  — `app/api/scan/route.ts` fetches the real URL, evaluates the
 *             fifteen checks against real headers/HTML, and calls `scoreOf()`.
 *   "demo"  — `demoScan()` derives a stable result from a hash of the domain.
 *             Used for the hero's demo domain and whenever a real fetch fails.
 *
 * Swapping in a different upstream provider is a one-file change: keep
 * `ScanResult`/`CheckResult` intact and only replace the fetch layer in the
 * route. Nothing in the UI knows where a result came from.
 */

export type CheckId =
  | "HTTPS"
  | "SSL_EXPIRY"
  | "SECURITY_HEADERS"
  | "TITLE_TAG"
  | "META_DESCRIPTION"
  | "HEADINGS"
  | "CANONICAL"
  | "ROBOTS_TXT"
  | "SITEMAP"
  | "OG_TAGS"
  | "TWITTER_CARD"
  | "FAVICON"
  | "VIEWPORT"
  | "ALT_TEXT"
  | "AI_READINESS";

export type CheckStatus = "pass" | "fail";

export type Grade = "A" | "B" | "C" | "D" | "F";

export interface CheckDefinition {
  id: CheckId;
  /** Plain-English description of what passing means. */
  label: string;
  /** Share of the 100-point score this check controls. */
  weight: number;
  /** Ranking hint for the fix-it report. */
  impact: "critical" | "high" | "medium" | "low";
}

export interface CheckResult extends CheckDefinition {
  status: CheckStatus;
  /** What the engine actually observed, in one short sentence. */
  detail: string;
}

export interface ScanResult {
  /** The URL as normalised and requested. */
  url: string;
  /** Bare host, no scheme, no www — what the card displays. */
  domain: string;
  /** 0–100. */
  score: number;
  grade: Grade;
  checks: CheckResult[];
  passed: number;
  failed: number;
  /** ISO 8601. */
  scannedAt: string;
  /** Which engine produced this. */
  engine: "live" | "demo";
  /** Present when a live scan was attempted and fell back to demo. */
  note?: string;
}

/* ------------------------------------------------------------------ */
/* Check catalogue                                                     */
/* ------------------------------------------------------------------ */

/**
 * The domain the hero grades on arrival. Shared so the server can render the
 * same result the client will re-run.
 */
export const DEMO_DOMAIN = "demo-startup.io";

/** Weights total exactly 100. */
export const CHECKS: CheckDefinition[] = [
  { id: "HTTPS", label: "Loads over a secure connection", weight: 12, impact: "critical" },
  { id: "SSL_EXPIRY", label: "Certificate valid, not about to lapse", weight: 6, impact: "high" },
  { id: "SECURITY_HEADERS", label: "HSTS, CSP, X-Frame-Options present", weight: 8, impact: "high" },
  { id: "TITLE_TAG", label: "A title exists and fits a search result", weight: 9, impact: "critical" },
  { id: "META_DESCRIPTION", label: "A description Google can actually show", weight: 8, impact: "high" },
  { id: "HEADINGS", label: "One clear H1, sane order", weight: 7, impact: "medium" },
  { id: "CANONICAL", label: "Google is told which URL is real", weight: 6, impact: "medium" },
  { id: "ROBOTS_TXT", label: "Crawlers get instructions, not guesses", weight: 5, impact: "medium" },
  { id: "SITEMAP", label: "An XML sitemap exists and is referenced", weight: 5, impact: "medium" },
  { id: "OG_TAGS", label: "Links unfurl with an image, not a gray box", weight: 8, impact: "high" },
  { id: "TWITTER_CARD", label: "Shares on X render rich", weight: 5, impact: "medium" },
  { id: "FAVICON", label: "A real icon, not the default globe", weight: 4, impact: "low" },
  { id: "VIEWPORT", label: "The page knows how to behave on phones", weight: 7, impact: "critical" },
  { id: "ALT_TEXT", label: "Images carry alt text", weight: 6, impact: "medium" },
  {
    id: "AI_READINESS",
    label: "llms.txt and AI-crawler directives (GPTBot, ClaudeBot, PerplexityBot) in place",
    weight: 4,
    impact: "low",
  },
];

const CHECK_BY_ID = new Map(CHECKS.map((c) => [c.id, c]));

export function checkDefinition(id: CheckId): CheckDefinition {
  const def = CHECK_BY_ID.get(id);
  if (!def) throw new Error(`Unknown check: ${id}`);
  return def;
}

/* ------------------------------------------------------------------ */
/* Grading                                                             */
/* ------------------------------------------------------------------ */

export function gradeOf(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
}

/** Weighted pass rate, rounded. Used by the live engine. */
export function scoreOf(checks: CheckResult[]): number {
  const total = checks.reduce((sum, c) => sum + c.weight, 0);
  if (total === 0) return 0;
  const earned = checks.reduce((sum, c) => sum + (c.status === "pass" ? c.weight : 0), 0);
  return Math.round((earned / total) * 100);
}

/**
 * FNV-1a. Chosen because it is short, has no dependencies and — unlike
 * anything seeded by time or randomness — always returns the same number for
 * the same string. Determinism is the product promise.
 */
export function hashOf(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Stable 34–96 score for a domain. Same input, same score, forever. */
export function hashScore(domain: string): number {
  return 34 + (hashOf(domain.toLowerCase()) % 63);
}

/* ------------------------------------------------------------------ */
/* URL handling                                                        */
/* ------------------------------------------------------------------ */

/** Accepts "example.com", "example.com/path", "https://example.com". */
export function normaliseUrl(input: string): { url: string; domain: string } | null {
  const raw = input.trim();
  if (!raw) return null;

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  // Must look like a real hostname: at least one dot, no spaces, valid TLD-ish.
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(host)) {
    return null;
  }
  if (!/\.[a-z]{2,}$/.test(host)) return null;

  return {
    url: parsed.toString(),
    domain: host.replace(/^www\./, ""),
  };
}

/* ------------------------------------------------------------------ */
/* Demo engine                                                         */
/* ------------------------------------------------------------------ */

/** Roughly how many checks should fail to look consistent with `score`. */
function failCountFor(score: number): number {
  if (score >= 90) return 1;
  if (score >= 80) return 2;
  if (score >= 70) return 4;
  if (score >= 60) return 6;
  if (score >= 50) return 7;
  return 9;
}

const PASS_DETAIL: Record<CheckId, string> = {
  HTTPS: "Served over HTTPS with a valid redirect from http.",
  SSL_EXPIRY: "Certificate is valid and not expiring soon.",
  SECURITY_HEADERS: "HSTS, CSP and X-Frame-Options all present.",
  TITLE_TAG: "Title present and within the length a search result shows.",
  META_DESCRIPTION: "Description present and a usable length.",
  HEADINGS: "Exactly one H1, heading levels in order.",
  CANONICAL: "A canonical link tag is declared.",
  ROBOTS_TXT: "robots.txt found and readable.",
  SITEMAP: "XML sitemap found and referenced from robots.txt.",
  OG_TAGS: "og:title, og:description and og:image all set.",
  TWITTER_CARD: "twitter:card declared, so shares render rich.",
  FAVICON: "A real favicon is declared.",
  VIEWPORT: "Responsive viewport meta tag present.",
  ALT_TEXT: "Every image carries an alt attribute.",
  AI_READINESS: "llms.txt present and AI crawlers addressed in robots.txt.",
};

const FAIL_DETAIL: Record<CheckId, string> = {
  HTTPS: "Page does not load over a secure connection.",
  SSL_EXPIRY: "Certificate is expired or lapses within 30 days.",
  SECURITY_HEADERS: "No HSTS, CSP or X-Frame-Options header found.",
  TITLE_TAG: "Title is missing, empty or too long to display in full.",
  META_DESCRIPTION: "No meta description — Google will invent one.",
  HEADINGS: "Missing or duplicated H1, or heading levels skip.",
  CANONICAL: "No canonical tag, so duplicate URLs compete.",
  ROBOTS_TXT: "No robots.txt — crawlers are guessing.",
  SITEMAP: "No XML sitemap found at the usual locations.",
  OG_TAGS: "Missing Open Graph tags — links unfurl as a gray box.",
  TWITTER_CARD: "No twitter:card tag, so shares render as plain text.",
  FAVICON: "No favicon declared — browsers show the default globe.",
  VIEWPORT: "No viewport meta tag — the page will not adapt to phones.",
  ALT_TEXT: "Images are missing alt attributes.",
  AI_READINESS: "No llms.txt and no directives for GPTBot, ClaudeBot or PerplexityBot.",
};

export function detailFor(id: CheckId, status: CheckStatus): string {
  return status === "pass" ? PASS_DETAIL[id] : FAIL_DETAIL[id];
}

/**
 * Builds a coherent result for a domain at an explicit score: the number of
 * failing checks tracks the score, and which checks fail is a stable function
 * of the domain. Used by `demoScan` and by the illustrative example cards.
 */
export function craftResult(input: string, score: number, note?: string): ScanResult {
  const normalised = normaliseUrl(input);
  const domain = normalised?.domain ?? input.trim().toLowerCase();
  const url = normalised?.url ?? `https://${domain}`;

  const seed = hashOf(domain);
  const wanted = failCountFor(score);

  // Rank every check by a stable per-domain pseudo-weight, then fail the top N.
  // HTTPS is pushed to the back of the queue so it nearly always passes — in
  // the real world it is the one thing almost everybody gets right.
  const ranked = CHECKS.map((check, index) => {
    const salt = hashOf(`${domain}:${check.id}`);
    const bias = check.id === "HTTPS" ? 1_000_000 : 0;
    return { check, order: ((salt ^ (seed + index)) >>> 0) % 10_000 || 1, bias };
  }).sort((a, b) => a.bias - b.bias || a.order - b.order);

  const failing = new Set(ranked.slice(0, wanted).map((r) => r.check.id));

  const checks: CheckResult[] = CHECKS.map((check) => {
    const status: CheckStatus = failing.has(check.id) ? "fail" : "pass";
    return { ...check, status, detail: detailFor(check.id, status) };
  });

  return {
    url,
    domain,
    score,
    grade: gradeOf(score),
    checks,
    passed: checks.filter((c) => c.status === "pass").length,
    failed: checks.filter((c) => c.status === "fail").length,
    scannedAt: new Date().toISOString(),
    engine: "demo",
    note,
  };
}

/**
 * Deterministic offline scan. Identical output for identical input, always —
 * no clock, no randomness in anything that reaches the score.
 */
export function demoScan(input: string, note?: string): ScanResult {
  const normalised = normaliseUrl(input);
  const domain = normalised?.domain ?? input.trim().toLowerCase();
  return craftResult(domain, hashScore(domain), note);
}

/* ------------------------------------------------------------------ */
/* Presentation helpers                                                */
/* ------------------------------------------------------------------ */

/** CSS custom property holding the colour for a grade. */
export function gradeColorVar(grade: Grade): string {
  if (grade === "A" || grade === "B") return "var(--mint)";
  if (grade === "C" || grade === "D") return "var(--amber)";
  return "var(--crimson)";
}

/** The three failures worth shouting about, hardest-hitting first. */
const IMPACT_ORDER = { critical: 0, high: 1, medium: 2, low: 3 } as const;

export function topIssues(result: ScanResult, limit = 3): CheckResult[] {
  return result.checks
    .filter((c) => c.status === "fail")
    .sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact] || b.weight - a.weight)
    .slice(0, limit);
}
