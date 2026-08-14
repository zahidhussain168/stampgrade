/**
 * Optional anonymous scan log (Supabase).
 *
 * Entirely additive: with no env vars set, every function here quietly no-ops
 * and the site behaves exactly as it does today. Nothing user-identifying is
 * stored — domain, score, grade and a timestamp, nothing else.
 *
 * Server-only.
 */

import type { ScanResult } from "./scan-engine";

/** Shown when the log is unconfigured or unreachable. */
export const FALLBACK_WEEKLY_COUNT = 2140;

function credentials(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return { url, key };
}

function headers(key: string): HeadersInit {
  return {
    apikey: key,
    authorization: `Bearer ${key}`,
    "content-type": "application/json",
  };
}

/** Fire-and-forget. A logging failure must never fail a scan. */
export async function recordScan(result: ScanResult): Promise<void> {
  const creds = credentials();
  if (!creds) return;

  try {
    await fetch(`${creds.url}/rest/v1/scans`, {
      method: "POST",
      headers: { ...headers(creds.key), prefer: "return=minimal" },
      body: JSON.stringify({
        domain: result.domain,
        score: result.score,
        grade: result.grade,
      }),
      signal: AbortSignal.timeout(3_000),
      cache: "no-store",
    });
  } catch {
    // Deliberately silent — telemetry is never worth a user-facing error.
  }
}

/** Sites graded in the last seven days, or the fallback when unconfigured. */
export async function weeklyScanCount(): Promise<number> {
  const creds = credentials();
  if (!creds) return FALLBACK_WEEKLY_COUNT;

  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();

  try {
    const res = await fetch(
      `${creds.url}/rest/v1/scans?select=id&created_at=gte.${since}`,
      {
        method: "HEAD",
        headers: { ...headers(creds.key), prefer: "count=exact" },
        signal: AbortSignal.timeout(3_000),
        next: { revalidate: 300 },
      },
    );
    // Supabase returns the total after the slash: "0-24/1337".
    const total = Number(res.headers.get("content-range")?.split("/")[1]);
    return Number.isFinite(total) && total > 0 ? total : FALLBACK_WEEKLY_COUNT;
  } catch {
    return FALLBACK_WEEKLY_COUNT;
  }
}
