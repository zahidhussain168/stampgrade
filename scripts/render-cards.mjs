/**
 * Renders the Wall of Grades images to public/gallery/ at 1200x900.
 *
 * The product is the artwork: every image here is a StampGrade card drawn from
 * the same tokens the site uses. Nothing is downloaded, traced or adapted —
 * satori lays it out, resvg rasterises it.
 *
 * Run with `npm run gallery`. Output is committed, so this never runs at build
 * or deploy time.
 */

import { Resvg } from "@resvg/resvg-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import satori from "satori";

const OUT = path.join(process.cwd(), "public", "gallery");
const W = 1200;
const H = 900;

/* --------------------------- design tokens -------------------------- */
const CANVAS = "#08090C";
const SURFACE = "#0E1014";
const SURFACE_2 = "#14171D";
const LINE = "#1F232B";
const LINE_STRONG = "#2B313B";
const TEXT_DIM = "#9BA1AB";
const TEXT_FAINT = "#787F8C";
const EMBER = "#FF6B52";
const MINT = "#3DDC97";
const AMBER = "#FFB224";
const CRIMSON = "#FF5C5C";

const gradeColor = (g) => (g === "A" || g === "B" ? MINT : g === "F" ? CRIMSON : AMBER);

/* ------------------------------ fonts ------------------------------- */

const ANDROID_UA =
  "Mozilla/5.0 (Linux; U; Android 4.0.3; en-us) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30";

async function googleTtf(family, weight) {
  const css = await (
    await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
      { headers: { "user-agent": ANDROID_UA } },
    )
  ).text();
  const src = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!src) throw new Error(`no ttf for ${family} ${weight}`);
  return {
    name: family,
    weight,
    style: "normal",
    data: Buffer.from(await (await fetch(src)).arrayBuffer()),
  };
}

/** Fontshare lists woff2, woff and ttf in one src; satori wants the ttf. */
async function fontshareTtf(slug, family, weight) {
  const css = await (
    await fetch(`https://api.fontshare.com/v2/css?f%5B%5D=${slug}@${weight}&display=swap`)
  ).text();
  const block = css.split("@font-face").find((b) => b.includes(`font-weight: ${weight}`));
  const url = block?.match(/url\('(\/\/[^']+\.ttf)'\)/)?.[1];
  if (!url) throw new Error(`no ttf for ${family} ${weight}`);
  return {
    name: family,
    weight,
    style: "normal",
    data: Buffer.from(await (await fetch(`https:${url}`)).arrayBuffer()),
  };
}

/* ------------------------------ helpers ----------------------------- */

const row = (children, style = {}) => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});

const text = (value, style = {}) => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children: value },
});

const mono = (value, size, color, extra = {}) =>
  text(value, { fontFamily: "JetBrains Mono", fontSize: size, color, ...extra });

const display = (value, size, color, weight = 700, extra = {}) =>
  text(value, {
    fontFamily: "Clash Display",
    fontWeight: weight,
    fontSize: size,
    color,
    lineHeight: 1,
    letterSpacing: "-0.02em",
    ...extra,
  });

const failChip = (label) =>
  row([mono(`× ${label}`, 17, CRIMSON)], {
    border: `1px solid rgba(255,92,92,0.45)`,
    backgroundColor: "rgba(255,92,92,0.10)",
    borderRadius: 12,
    padding: "7px 12px",
  });

const passChip = (n) =>
  row([mono(`PASS × ${n}`, 17, TEXT_DIM)], {
    border: `1px solid ${LINE}`,
    backgroundColor: SURFACE_2,
    borderRadius: 12,
    padding: "7px 12px",
  });

/** The grade card itself, at a given width. */
function card({ domain, score, grade, fails, passes, watermark = true, brand, width = 560 }) {
  const colour = gradeColor(grade);

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width,
        backgroundColor: SURFACE,
        border: `1px solid ${LINE}`,
        borderRadius: 24,
        padding: 34,
        boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
      },
      children: [
        row(
          [
            mono(domain, 19, TEXT_DIM),
            ...(brand
              ? [
                  row(
                    [
                      // Placeholder client mark: a ring and a bar, drawn here.
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            width: 18,
                            height: 18,
                            borderRadius: 9,
                            border: `3px solid ${EMBER}`,
                          },
                          children: "",
                        },
                      },
                      mono(brand, 15, TEXT_DIM, { marginLeft: 8 }),
                    ],
                    { alignItems: "center" },
                  ),
                ]
              : []),
          ],
          { justifyContent: "space-between", alignItems: "center", width: "100%" },
        ),

        row(
          [
            {
              type: "div",
              props: {
                style: { display: "flex", flexDirection: "column" },
                children: [
                  display(String(score), 120, colour, 700, { letterSpacing: "-0.04em" }),
                  mono("OUT OF 100", 17, TEXT_FAINT, { marginTop: 8 }),
                ],
              },
            },
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 108,
                  height: 108,
                  border: `3px solid ${colour}`,
                  borderRadius: 22,
                  transform: "rotate(-6deg)",
                },
                children: display(grade, 60, colour),
              },
            },
          ],
          { justifyContent: "space-between", alignItems: "flex-start", marginTop: 26, width: "100%" },
        ),

        // Grade rail
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              width: "100%",
              height: 3,
              backgroundColor: LINE_STRONG,
              borderRadius: 3,
              marginTop: 30,
            },
            children: {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  width: `${score}%`,
                  height: 3,
                  backgroundColor: colour,
                  borderRadius: 3,
                },
                children: "",
              },
            },
          },
        },

        row([...fails.map(failChip), passChip(passes)], {
          gap: 10,
          marginTop: 28,
          flexWrap: "wrap",
          width: "100%",
        }),

        ...(watermark
          ? [
              mono("graded by StampGrade — get yours free · stampgrade.com", 14, TEXT_FAINT, {
                marginTop: 30,
              }),
            ]
          : [
              mono("prepared for the client · white-label", 14, TEXT_FAINT, { marginTop: 30 }),
            ]),
      ],
    },
  };
}

/** The 1200x900 plate a card sits on. */
function plate({ tint, children, caption, eyebrow }) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: W,
        height: H,
        backgroundColor: CANVAS,
        backgroundImage: `radial-gradient(60% 50% at 70% 18%, ${tint}22 0%, transparent 70%), radial-gradient(50% 45% at 12% 88%, #4C7DFF14 0%, transparent 70%)`,
        padding: 64,
        justifyContent: "space-between",
      },
      children: [
        mono(eyebrow, 17, EMBER, { letterSpacing: "0.1em" }),
        row([children], { justifyContent: "center", alignItems: "center", width: "100%" }),
        mono(caption, 18, TEXT_FAINT),
      ],
    },
  };
}

/* -------------------------------- main ------------------------------ */

const fonts = await Promise.all([
  fontshareTtf("clash-display", "Clash Display", 600),
  fontshareTtf("clash-display", "Clash Display", 700),
  googleTtf("JetBrains Mono", 400),
  googleTtf("JetBrains Mono", 500),
]);

await mkdir(OUT, { recursive: true });

async function render(name, tree) {
  const svg = await satori(tree, { width: W, height: H, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng();
  await writeFile(path.join(OUT, `${name}.png`), Buffer.from(png));
  console.log("wrote", `${name}.png`);
}

await render(
  "brag",
  plate({
    tint: MINT,
    eyebrow: "THE BRAG",
    caption: "northwind.studio · 96/100 · grade A",
    children: card({
      domain: "northwind.studio",
      score: 96,
      grade: "A",
      fails: ["ALT_TEXT"],
      passes: 14,
    }),
  }),
);

await render(
  "confess",
  plate({
    tint: CRIMSON,
    eyebrow: "THE CONFESSION",
    caption: "kettleworks.co · 38/100 · grade F",
    children: card({
      domain: "kettleworks.co",
      score: 38,
      grade: "F",
      fails: ["SECURITY_HEADERS", "OG_TAGS", "SITEMAP"],
      passes: 6,
    }),
  }),
);

await render(
  "before-after",
  plate({
    tint: AMBER,
    eyebrow: "THE FIX",
    caption: "One afternoon of work · 41 → 92",
    children: row(
      [
        card({
          domain: "grovehouse.co.uk",
          score: 41,
          grade: "D",
          fails: ["TITLE_TAG", "OG_TAGS"],
          passes: 7,
          width: 440,
        }),
        display("→", 56, TEXT_FAINT, 600, { marginLeft: 26, marginRight: 26 }),
        card({
          domain: "grovehouse.co.uk",
          score: 92,
          grade: "A",
          fails: [],
          passes: 15,
          width: 440,
        }),
      ],
      { alignItems: "center" },
    ),
  }),
);

await render(
  "white-label",
  plate({
    tint: EMBER,
    eyebrow: "THE AGENCY BUILD",
    caption: "Your logo, your colours, no watermark",
    children: card({
      domain: "client-site.com",
      score: 88,
      grade: "B",
      fails: ["AI_READINESS"],
      passes: 14,
      watermark: false,
      brand: "MERIDIAN STUDIO",
    }),
  }),
);

console.log("gallery complete");
