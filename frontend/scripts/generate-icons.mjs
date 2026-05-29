import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");
const source = join(__dirname, "source-icon.png");

// Brand background used for padding maskable/apple icons.
const BG = { r: 15, g: 23, b: 42, alpha: 1 }; // #0F172A

async function rounded(size, out) {
  await sharp(source)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(join(iconsDir, out));
}

// Maskable icons need ~10-12% safe-zone padding so the mark is not clipped
// when the platform applies its own mask shape.
async function maskable(size, out) {
  const pad = Math.round(size * 0.12);
  const inner = size - pad * 2;
  const resized = await sharp(source).resize(inner, inner, { fit: "cover" }).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: resized, top: pad, left: pad }])
    .png()
    .toFile(join(iconsDir, out));
}

await rounded(192, "web-app-manifest-192x192.png");
await rounded(512, "icon512_rounded.png");
await maskable(512, "icon512_maskable.png");
await maskable(180, "apple-touch-icon.png");

// Favicon (96x96 png stored as favicon.ico path target lives in /public).
await sharp(source)
  .resize(96, 96, { fit: "cover" })
  .png()
  .toFile(join(__dirname, "..", "public", "favicon-96x96.png"));

console.log("Generated PWA icons.");
