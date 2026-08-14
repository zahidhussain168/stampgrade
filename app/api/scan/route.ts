import { NextResponse } from "next/server";

import { ScanError, liveScan } from "@/lib/live-scan";
import { demoScan, normaliseUrl } from "@/lib/scan-engine";
import { recordScan } from "@/lib/scan-log";

// The live engine uses `node:tls` and `node:dns`, so this route must not run
// on the edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Crude per-instance throttle. Serverless means this is per-container rather
 * than global, so it is a speed bump for casual abuse, not a real quota — a
 * shared store is the upgrade path when traffic justifies it.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    // Opportunistic cleanup so the map cannot grow without bound.
    if (hits.size > 5_000) {
      for (const [key, value] of hits) if (now > value.resetAt) hits.delete(key);
    }
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many scans from this connection. Give it a minute." },
      { status: 429 },
    );
  }

  let url: unknown;
  try {
    ({ url } = await request.json());
  } catch {
    return NextResponse.json({ error: "Send a JSON body with a url." }, { status: 400 });
  }

  if (typeof url !== "string" || url.length > 2_048) {
    return NextResponse.json({ error: "That does not look like a valid URL." }, { status: 400 });
  }

  const normalised = normaliseUrl(url);
  if (!normalised) {
    return NextResponse.json({ error: "That does not look like a valid URL." }, { status: 400 });
  }

  try {
    const result = await liveScan(normalised.url);
    // Never block the response on telemetry.
    void recordScan(result);
    return NextResponse.json(result);
  } catch (error) {
    // A site we cannot reach is not a server error — the visitor still gets a
    // real, deterministic card, clearly marked as an offline estimate.
    const reason =
      error instanceof ScanError ? error.message : "We could not complete a live scan.";
    return NextResponse.json(
      demoScan(normalised.domain, `${reason} Showing an offline estimate.`),
    );
  }
}
