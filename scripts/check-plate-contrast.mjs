/**
 * Measures real backdrop luminance behind text that sits over a photo plate.
 *
 * Hides the section's text, screenshots the backdrop, samples the brightest
 * pixel inside each text element's box, then computes the contrast ratio
 * against that element's own colour. Sampling the brightest pixel is the
 * pessimistic case, which is the one that matters.
 */
import fs from "node:fs";
import { createRequire } from "node:module";
const sharp = createRequire(import.meta.url)("sharp");

const [, , url, selector, out] = process.argv;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const list = await (await fetch("http://127.0.0.1:9333/json/list")).json();
const pg = list.find((x) => x.type === "page");
const ws = new WebSocket(pg.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const send = (m, p = {}) =>
  new Promise((r) => {
    const i = ++id;
    pending.set(i, r);
    ws.send(JSON.stringify({ id: i, method: m, params: p }));
  });
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result);
    pending.delete(m.id);
  }
};
await new Promise((r) => (ws.onopen = r));
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440, height: 950, deviceScaleFactor: 1, mobile: false,
});
await send("Page.navigate", { url });
await sleep(10000);

// Park the section in view.
await send("Runtime.evaluate", {
  expression: `(async () => {
    const s = document.querySelector('${selector}');
    window.scrollTo({ top: s.offsetTop - 30, behavior: 'instant' });
    await new Promise(r => setTimeout(r, 1500));
  })()`,
  awaitPromise: true,
});

// Collect text boxes and colours before hiding anything.
const boxes = JSON.parse(
  (await send("Runtime.evaluate", {
    expression: `(() => {
      const root = document.querySelector('${selector}');
      const out = [];
      root.querySelectorAll('p,h2,h3,span,a,button,li').forEach(el => {
        const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
        if (!txt) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > innerHeight) return;
        out.push({ text: txt.slice(0, 26), color: cs.color, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) });
      });
      return JSON.stringify(out);
    })()`,
    returnByValue: true,
  })).result.value,
);

// Hide the text, leaving the plate and every other layer exactly as it was.
await send("Runtime.evaluate", {
  expression: `(() => {
    const root = document.querySelector('${selector}');
    root.querySelectorAll('p,h2,h3,span,a,button,li').forEach(el => {
      const t = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
      if (t) el.style.color = 'transparent';
    });
  })()`,
});
if (process.argv[6]) { await send("Runtime.evaluate", { expression: process.argv[6] }); }
await sleep(600);

const shot = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
ws.close();

const img = sharp(out);
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const lin = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const parse = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);

let worst = null;
for (const b of boxes) {
  let maxL = 0;
  for (let y = Math.max(0, b.y); y < Math.min(info.height, b.y + b.h); y += 2) {
    for (let x = Math.max(0, b.x); x < Math.min(info.width, b.x + b.w); x += 2) {
      const i = (y * info.width + x) * info.channels;
      const l = lum(data[i], data[i + 1], data[i + 2]);
      if (l > maxL) maxL = l;
    }
  }
  const [r, g, bl] = parse(b.color);
  const fg = lum(r, g, bl);
  const ratio = (Math.max(fg, maxL) + 0.05) / (Math.min(fg, maxL) + 0.05);
  if (!worst || ratio < worst.ratio) worst = { ...b, ratio, backdropLum: maxL };
  if (ratio < 4.5) console.log("  FAIL", ratio.toFixed(2), JSON.stringify(b.text), b.color);
}
console.log("worst contrast over plate:", worst.ratio.toFixed(2), "on", JSON.stringify(worst.text));
console.log("checked", boxes.length, "text boxes");
