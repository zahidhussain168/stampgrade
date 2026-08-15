/**
 * Builds the AVIF/WebP derivatives the site actually ships from the licensed
 * originals in public/photos/.
 *
 * Originals stay in the repo untouched so the grading stays reversible and the
 * licence provenance is intact. Everything here is deterministic: run
 * `npm run photos` and the output is byte-identical.
 *
 * Sizes are chosen against how each plate is used. None of the sources is
 * larger than about 1024px, so nothing is upscaled — a plate that needs to
 * cover more than its native width is blurred or darkened in CSS instead,
 * which is where the resolution limit stops being visible.
 */

import sharp from "sharp";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

const SRC = path.join(process.cwd(), "public", "photos");
const OUT = path.join(SRC, "opt");

/** width: target px. crop: sharp extract region applied before resize. */
const JOBS = [
  { file: "texture-paper-large.webp", width: 1024, quality: 62 },
  { file: "texture-paper-band.webp", width: 1024, quality: 62 },
  { file: "typewriter-keyed.jpg", width: 1024, quality: 58 },
  { file: "smoke-black.jpg", width: 768, quality: 56 },
  { file: "light-trail.jpg", width: 768, quality: 56 },
  { file: "wax-seals-red.jpg", width: 512, quality: 58 },
  {
    file: "nasa-nile-night.jpg",
    width: 720,
    quality: 58,
    // The original carries baked-in map labels (Alexandria, Cairo, Suez
    // Canal, Red Sea, Luxor, Aswan) plus a scale bar and north arrow. This
    // window is the widest band of the frame that contains none of them.
    crop: { left: 0, top: 330, width: 720, height: 290 },
    rename: "nile-band",
  },
];

await mkdir(OUT, { recursive: true });

const rows = [];

for (const job of JOBS) {
  const base = job.rename ?? path.parse(job.file).name;
  let pipeline = sharp(path.join(SRC, job.file));
  if (job.crop) pipeline = pipeline.extract(job.crop);
  pipeline = pipeline.resize({ width: job.width, withoutEnlargement: true });

  const meta = await pipeline.clone().metadata();

  await pipeline.clone().avif({ quality: job.quality, effort: 6 }).toFile(path.join(OUT, `${base}.avif`));
  await pipeline.clone().webp({ quality: job.quality + 8 }).toFile(path.join(OUT, `${base}.webp`));

  const avif = (await stat(path.join(OUT, `${base}.avif`))).size;
  const webp = (await stat(path.join(OUT, `${base}.webp`))).size;
  const src = (await stat(path.join(SRC, job.file))).size;

  rows.push({
    base,
    dims: `${meta.width}x${meta.height}`,
    src: Math.round(src / 1024),
    avif: Math.round(avif / 1024),
    webp: Math.round(webp / 1024),
  });
}

console.log("name".padEnd(22), "dims".padEnd(10), "src".padStart(6), "avif".padStart(7), "webp".padStart(7));
let totalSrc = 0;
let totalAvif = 0;
for (const r of rows) {
  console.log(r.base.padEnd(22), r.dims.padEnd(10), (r.src + "KB").padStart(6), (r.avif + "KB").padStart(7), (r.webp + "KB").padStart(7));
  totalSrc += r.src;
  totalAvif += r.avif;
}
console.log("\nshipped (avif):", totalAvif + "KB", "from", totalSrc + "KB of originals");

const unused = (await readdir(SRC)).filter(
  (f) => /\.(jpg|webp)$/.test(f) && !JOBS.some((j) => j.file === f),
);
if (unused.length) console.log("not used on the site:", unused.join(", "));
