# StampGrade

A free website scorecard. Paste a URL, get one brutal score out of 100 from
fifteen deterministic checks, a rubber-stamped grade letter, and a share card
you'll either brag about or quietly hide.

Live at **[stampgrade.com](https://stampgrade.com)**.

## How it works

Fifteen pass/fail checks — HTTPS, certificate health, security headers, title,
meta description, headings, canonical, robots.txt, sitemap, Open Graph, Twitter
card, favicon, viewport, image alt text and AI-crawler readiness. Each is
weighted, and the weighted pass rate is the score. Same page in, same score out.

Two engines sit behind one result shape:

- **Live** — `app/api/scan/route.ts` fetches the URL server-side and evaluates
  the checks against real headers and HTML.
- **Demo** — `lib/scan-engine.ts` derives a stable result from a hash of the
  domain. Used for the hero's demo card and whenever a site can't be reached.

Swapping in a different upstream provider means replacing the fetch layer in the
route and leaving `ScanResult` alone. Nothing in the UI knows where a result
came from.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4, every colour and radius a CSS-variable design token
- Motion for springs, Lucide for icons
- Schibsted Grotesk + JetBrains Mono, self-hosted via `next/font`

## Local setup

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

```bash
npm run build    # production build
npm run lint     # eslint
npm run og       # regenerate og.png, favicon and touch icons
```

## Environment variables

**None are required.** With an empty environment the site builds, deploys and
grades sites correctly — the live scanner needs no API key, and anything
optional degrades silently.

Copy `.env.example` to `.env.local` to enable the extras:

| Variable              | Required | What it does                                                            |
| --------------------- | -------- | ----------------------------------------------------------------------- |
| `SUPABASE_URL`        | No       | Anonymous scan log (domain, score, grade). Nothing on the site reads it yet. |
| `SUPABASE_SECRET_KEY` | No       | Pairs with the above. Without both, nothing is logged and nothing breaks. |
| `RESEND_API_KEY`      | No       | Reserved for scheduled re-scan alerts. Nothing sends mail yet.           |

All three are server-only. None may ever carry a `NEXT_PUBLIC_` prefix.

To enable the scan log, add the same variables in the Vercel dashboard under
**Settings → Environment Variables**, and create the table:

```sql
create table scans (
  id bigint generated always as identity primary key,
  domain text not null,
  score int not null,
  grade text not null,
  created_at timestamptz not null default now()
);
```

## Deploying

Standard Next.js on Vercel — no `vercel.json`, nothing to configure. Push to
`main` and it ships.
