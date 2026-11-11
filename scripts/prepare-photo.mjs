/**
 * Prepares a camera photo for the web: crop, resize, convert to WebP, and
 * strip all metadata (EXIF can include GPS location, camera serials, times).
 *
 *   node scripts/prepare-photo.mjs <input> <output.webp> <left> <top> <size> [outSize=600]
 *
 * <left> <top> <size> = the square to keep, in the original's pixels.
 */
import sharp from 'sharp'

const [input, output, left, top, size, outSize = '600'] = process.argv.slice(2)
if (!input || !output || size === undefined) {
  console.error('usage: node scripts/prepare-photo.mjs <input> <output.webp> <left> <top> <size> [outSize]')
  process.exit(1)
}

const info = await sharp(input)
  .rotate() // apply EXIF orientation before cropping
  .extract({ left: Number(left), top: Number(top), width: Number(size), height: Number(size) })
  .resize(Number(outSize), Number(outSize))
  .webp({ quality: 82 })
  // sharp drops all metadata (EXIF/GPS/ICC) unless .withMetadata() is used
  .toFile(output)

console.log(`${input} -> ${output}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)} kB`)
