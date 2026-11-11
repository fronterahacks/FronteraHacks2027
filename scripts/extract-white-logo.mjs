/**
 * Turns a white logo on a dark background (e.g. a screenshot) into a clean
 * transparent white PNG.
 *
 *   node scripts/extract-white-logo.mjs <input.png> <output.png> [scale=3]
 *
 * 1. Upscales with bilinear interpolation (smooths the blocky pixels).
 * 2. Maps brightness to opacity with a tight cutoff, which re-sharpens the
 *    letter edges: dark background -> transparent, white letters -> opaque.
 * 3. Writes every pixel white, trimmed to the logo's bounds.
 * A vector (SVG) original will always be sharper; this is the fallback.
 */
import fs from 'node:fs'
import { PNG } from 'pngjs'

const [input, output, scaleArg] = process.argv.slice(2)
if (!input || !output) {
  console.error('usage: node scripts/extract-white-logo.mjs <input.png> <output.png> [scale]')
  process.exit(1)
}
const SCALE = Number(scaleArg ?? 3)
// Brightness band for the edge: below LOW = transparent, above HIGH = opaque.
const LOW = 0.45
const HIGH = 0.7

const src = PNG.sync.read(fs.readFileSync(input))
const lum = (x, y) => {
  const cx = Math.min(src.width - 1, Math.max(0, x))
  const cy = Math.min(src.height - 1, Math.max(0, y))
  const i = (cy * src.width + cx) * 4
  return (0.2126 * src.data[i] + 0.7152 * src.data[i + 1] + 0.0722 * src.data[i + 2]) / 255
}
const bilinear = (fx, fy) => {
  const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0
  const top = lum(x0, y0) * (1 - tx) + lum(x0 + 1, y0) * tx
  const bottom = lum(x0, y0 + 1) * (1 - tx) + lum(x0 + 1, y0 + 1) * tx
  return top * (1 - ty) + bottom * ty
}
const smooth = (t) => t * t * (3 - 2 * t)

const W = src.width * SCALE
const H = src.height * SCALE
const alpha = new Float32Array(W * H)
let minX = W, minY = H, maxX = -1, maxY = -1
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const l = bilinear((x + 0.5) / SCALE - 0.5, (y + 0.5) / SCALE - 0.5)
    const a = smooth(Math.min(1, Math.max(0, (l - LOW) / (HIGH - LOW))))
    alpha[y * W + x] = a
    if (a > 0.02) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x)
      minY = Math.min(minY, y); maxY = Math.max(maxY, y)
    }
  }
}

// Trim to the logo with a small margin.
const pad = 2 * SCALE
minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad)
maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad)
const out = new PNG({ width: maxX - minX + 1, height: maxY - minY + 1 })
for (let y = minY; y <= maxY; y++) {
  for (let x = minX; x <= maxX; x++) {
    const o = ((y - minY) * out.width + (x - minX)) * 4
    out.data[o] = out.data[o + 1] = out.data[o + 2] = 255
    out.data[o + 3] = Math.round(alpha[y * W + x] * 255)
  }
}
fs.writeFileSync(output, PNG.sync.write(out))
console.log(`${input} -> ${output}: ${out.width}x${out.height}`)
