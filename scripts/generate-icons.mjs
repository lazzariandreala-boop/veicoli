/**
 * Genera icon-192.png e icon-512.png dalla SVG.
 * Richiede: npm install -D sharp
 * Uso: node scripts/generate-icons.mjs
 */
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svg = readFileSync(resolve(__dirname, '../public/icon.svg'))

for (const size of [192, 512]) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(resolve(__dirname, `../public/icon-${size}.png`))
  console.log(`✓ icon-${size}.png`)
}
