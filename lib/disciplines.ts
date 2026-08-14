import { CHECKS, type CheckDefinition, type CheckId } from "./scan-engine";

/**
 * The fifteen checks grouped into the four things a site is actually being
 * judged on. Read-only view over the engine's own catalogue — the engine is
 * the source of truth for what exists, this file only decides how it reads.
 *
 * Every check belongs to exactly one discipline, and the counts are derived
 * rather than typed, so they cannot drift from the engine.
 */

export type DisciplineId = "security" | "search" | "social" | "ai";

const MEMBERSHIP: Record<CheckId, DisciplineId> = {
  HTTPS: "security",
  SSL_EXPIRY: "security",
  SECURITY_HEADERS: "security",

  TITLE_TAG: "search",
  META_DESCRIPTION: "search",
  HEADINGS: "search",
  CANONICAL: "search",
  ROBOTS_TXT: "search",
  SITEMAP: "search",
  // Both are ranking inputs before they are anything else: Google indexes
  // mobile-first and reads alt text as page content.
  VIEWPORT: "search",
  ALT_TEXT: "search",

  OG_TAGS: "social",
  TWITTER_CARD: "social",
  FAVICON: "social",

  AI_READINESS: "ai",
};

export interface Discipline {
  id: DisciplineId;
  index: string;
  name: string;
  /** One line, examiner voice. What passing this actually buys you. */
  promise: string;
  covers: string;
  checks: CheckDefinition[];
}

const ORDER: { id: DisciplineId; name: string; promise: string; covers: string }[] = [
  {
    id: "security",
    name: "Security",
    promise: "The padlock is the easy part. Most sites stop there.",
    covers: "HTTPS, certificates, headers",
  },
  {
    id: "search",
    name: "Search",
    promise: "What Google reads before it decides where to put you.",
    covers: "Titles, meta, canonical, robots, sitemap, viewport, alt text",
  },
  {
    id: "social",
    name: "Social",
    promise: "Whether your link arrives dressed or turns up as a grey box.",
    covers: "Open Graph, Twitter, favicon",
  },
  {
    id: "ai",
    name: "AI readiness",
    promise: "The crawlers that are already reading you, whether you asked or not.",
    covers: "llms.txt, crawler directives",
  },
];

export const DISCIPLINES: Discipline[] = ORDER.map((entry, i) => ({
  ...entry,
  index: String(i + 1).padStart(2, "0"),
  checks: CHECKS.filter((check) => MEMBERSHIP[check.id] === entry.id),
}));

/** Guards the mapping against the engine gaining a check nobody filed. */
export const TOTAL_GROUPED = DISCIPLINES.reduce((n, d) => n + d.checks.length, 0);
