/**
 * Generates the static brand assets committed under public/:
 *   og.png              1200x630 unfurl image — a 96/A card on the dark canvas
 *   icon.svg            scalable favicon
 *   favicon.ico         32x32, PNG-in-ICO
 *   apple-touch-icon.png 180x180
 *
 * Run with `npm run og`. Output is committed, so nothing here runs at build
 * or deploy time and the site never depends on it.
 */

import { Resvg } from "@resvg/resvg-js";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import satori from "satori";

const OUT = path.join(process.cwd(), "public");

/* --------------------------- design tokens -------------------------- */
const CANVAS = "#08090C";
const SURFACE = "#0E1014";
const SURFACE_2 = "#14171D";
const LINE = "#1F232B";
const TEXT = "#F4F3F0";
const TEXT_DIM = "#9BA1AB";
const TEXT_FAINT = "#787F8C";
const EMBER = "#FF6B52";
const MINT = "#3DDC97";

/* ------------------------------ fonts ------------------------------- */

// Google's CSS API serves a different font format per user agent. Satori's
// parser wants plain TTF, which is what old Android asks for — modern agents
// get woff2 and IE-era ones get EOT, neither of which it can read.
const TTF_UA =
  "Mozilla/5.0 (Linux; U; Android 4.0.3; en-us) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30";

async function loadFont(family, weight) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family,
  )}:wght@${weight}`;
  const css = await fetch(url, { headers: { "user-agent": TTF_UA } }).then((r) => r.text());

  const src = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!src) throw new Error(`No TTF for ${family} ${weight}`);

  const data = await fetch(src).then((r) => r.arrayBuffer());
  return { name: family, weight, style: "normal", data: Buffer.from(data) };
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

/* ------------------------------ og image ---------------------------- */

function ogCard() {
  const chip = (label) =>
    text(label, {
      fontFamily: "JetBrains Mono",
      fontSize: 15,
      color: TEXT_DIM,
      backgroundColor: SURFACE_2,
      border: `1px solid ${LINE}`,
      borderRadius: 10,
      padding: "6px 10px",
    });

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: 470,
        backgroundColor: SURFACE,
        border: `1px solid ${LINE}`,
        borderRadius: 22,
        padding: 30,
        boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
      },
      children: [
        text("northwind.studio", {
          fontFamily: "JetBrains Mono",
          fontSize: 17,
          color: TEXT_DIM,
        }),

        row(
          [
            {
              type: "div",
              props: {
                style: { display: "flex", flexDirection: "column" },
                children: [
                  text("96", {
                    fontFamily: "Schibsted Grotesk",
                    fontSize: 108,
                    fontWeight: 800,
                    color: MINT,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }),
                  text("OUT OF 100", {
                    fontFamily: "JetBrains Mono",
                    fontSize: 15,
                    color: TEXT_FAINT,
                    marginTop: 6,
                  }),
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
                  width: 96,
                  height: 96,
                  border: `3px solid ${MINT}`,
                  borderRadius: 20,
                  transform: "rotate(-6deg)",
                },
                children: text("A", {
                  fontFamily: "Schibsted Grotesk",
                  fontSize: 54,
                  fontWeight: 800,
                  color: MINT,
                  lineHeight: 1,
                }),
              },
            },
          ],
          { justifyContent: "space-between", alignItems: "flex-start", marginTop: 22 },
        ),

        // Grade rail, filled to 96%.
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              width: "100%",
              height: 3,
              backgroundColor: LINE,
              borderRadius: 3,
              marginTop: 26,
            },
            children: {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  width: "96%",
                  height: 3,
                  backgroundColor: MINT,
                  borderRadius: 3,
                },
                children: "",
              },
            },
          },
        },

        row([chip("ALT_TEXT")], { gap: 8, marginTop: 26 }),

        // No ⌁ here: JetBrains Mono has no glyph for U+2301 and satori has no
        // per-glyph fallback, so it would render as tofu. The live page keeps
        // it — browsers fall back for that one character.
        text("graded by StampGrade — get yours free · stampgrade.com", {
          fontFamily: "JetBrains Mono",
          fontSize: 12,
          color: TEXT_FAINT,
          marginTop: 28,
        }),
      ],
    },
  };
}

function ogImage() {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        width: 1200,
        height: 630,
        backgroundColor: CANVAS,
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 72px",
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", width: 530 },
            children: [
              text("15 DETERMINISTIC CHECKS", {
                fontFamily: "JetBrains Mono",
                fontSize: 16,
                color: EMBER,
                letterSpacing: "0.08em",
              }),
              text("Your website has a grade.", {
                fontFamily: "Schibsted Grotesk",
                fontWeight: 800,
                fontSize: 66,
                color: TEXT,
                letterSpacing: "-0.03em",
                lineHeight: 1.04,
                marginTop: 20,
              }),
              text("One brutal number out of 100, and a card you can share.", {
                fontFamily: "Schibsted Grotesk",
                fontWeight: 700,
                fontSize: 24,
                color: TEXT_DIM,
                lineHeight: 1.35,
                marginTop: 22,
              }),
              text("stampgrade.com", {
                fontFamily: "JetBrains Mono",
                fontSize: 19,
                color: TEXT_FAINT,
                marginTop: 34,
              }),
            ],
          },
        },
        ogCard(),
      ],
    },
  };
}

/* -------------------------------- icon ------------------------------ */

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="${EMBER}"/>
  <rect x="18" y="12" width="12" height="3" rx="1.5" fill="${CANVAS}"/>
  <text x="32" y="48" font-family="Helvetica, Arial, sans-serif" font-size="38" font-weight="bold" fill="${CANVAS}" text-anchor="middle">S</text>
</svg>`;

function pngToIco(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image

  const entry = Buffer.alloc(16);
  entry[0] = 32; // width
  entry[1] = 32; // height
  entry[2] = 0; // palette
  entry[3] = 0; // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, png]);
}

function renderSvg(svg, width) {
  return Buffer.from(
    new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng(),
  );
}

/* -------------------------------- main ------------------------------ */

const fonts = await Promise.all([
  loadFont("Schibsted Grotesk", 800),
  loadFont("Schibsted Grotesk", 700),
  loadFont("JetBrains Mono", 400),
]);

await mkdir(OUT, { recursive: true });

const ogSvg = await satori(ogImage(), { width: 1200, height: 630, fonts });
await writeFile(path.join(OUT, "og.png"), renderSvg(ogSvg, 1200));

await writeFile(path.join(OUT, "icon.svg"), ICON_SVG);
await writeFile(path.join(OUT, "apple-touch-icon.png"), renderSvg(ICON_SVG, 180));
await writeFile(path.join(OUT, "favicon.ico"), pngToIco(renderSvg(ICON_SVG, 32)));

console.log("wrote og.png, icon.svg, favicon.ico, apple-touch-icon.png");
