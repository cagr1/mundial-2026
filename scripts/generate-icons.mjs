/**
 * Generates public/icon-192.png and public/icon-512.png from scratch using only
 * Node.js built-ins (zlib + Buffer). No external dependencies required.
 *
 * Design: lacquer black background (#0f0e0c) + kinpaku gold (#d4a73d) circle
 * with two horizontal stripes that suggest a football stitching pattern.
 *
 * Usage:
 *   node scripts/generate-icons.mjs
 */

import { deflateSync } from 'zlib'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

// ─── CRC32 ────────────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  return table
})()

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

// ─── PNG chunk builder ────────────────────────────────────────────────────────

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.allocUnsafe(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.allocUnsafe(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

// ─── Pixel drawing helpers ────────────────────────────────────────────────────

/**
 * Draw the icon into a flat RGBA Uint8Array (size × size × 4).
 * Colors:
 *   bg  = lacquer  #0f0e0c  → [15, 14, 12]
 *   fg  = kinpaku  #d4a73d  → [212, 167, 61]
 *   mid = slightly lighter background for inner detail [22, 21, 18]
 */
function drawIcon(size) {
  const pixels = new Uint8Array(size * size * 4)

  const BG  = [0x0f, 0x0e, 0x0c, 255]
  const FG  = [0xd4, 0xa7, 0x3d, 255]
  const MID = [0x16, 0x15, 0x12, 255]

  const cx = size / 2
  const cy = size / 2
  const outerR  = size * 0.42
  const innerR  = size * 0.34
  const stripeH = size * 0.06
  const stripeY1 = cy - size * 0.10
  const stripeY2 = cy + size * 0.10

  function setPixel(x, y, color) {
    const i = (y * size + x) * 4
    pixels[i]     = color[0]
    pixels[i + 1] = color[1]
    pixels[i + 2] = color[2]
    pixels[i + 3] = color[3]
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      const dist2 = dx * dx + dy * dy

      if (dist2 <= outerR * outerR) {
        // Inside the main gold circle
        if (dist2 <= innerR * innerR) {
          // Inner area: darker bg with two horizontal stripes
          const inStripe1 = y >= stripeY1 - stripeH / 2 && y <= stripeY1 + stripeH / 2
          const inStripe2 = y >= stripeY2 - stripeH / 2 && y <= stripeY2 + stripeH / 2
          setPixel(x, y, inStripe1 || inStripe2 ? FG : MID)
        } else {
          // Ring area: gold
          setPixel(x, y, FG)
        }
      } else {
        setPixel(x, y, BG)
      }
    }
  }

  return pixels
}

// ─── PNG builder ─────────────────────────────────────────────────────────────

function buildPng(size) {
  const pixels = drawIcon(size)

  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR: width, height, bit-depth=8, color-type=6 (RGBA), compression=0, filter=0, interlace=0
  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8]  = 8  // bit depth
  ihdr[9]  = 6  // RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  // Raw image data: filter byte (0 = None) per row, then RGBA pixels
  const stride = 1 + size * 4
  const rawSize = size * stride
  const raw = Buffer.allocUnsafe(rawSize)
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0  // filter: None
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4
      const dst = y * stride + 1 + x * 4
      raw[dst]     = pixels[src]
      raw[dst + 1] = pixels[src + 1]
      raw[dst + 2] = pixels[src + 2]
      raw[dst + 3] = pixels[src + 3]
    }
  }

  const compressed = deflateSync(raw, { level: 9 })

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

// ─── Main ─────────────────────────────────────────────────────────────────────

for (const size of [192, 512]) {
  const png = buildPng(size)
  const out = join(publicDir, `icon-${size}.png`)
  writeFileSync(out, png)
  console.log(`✓ Created ${out} (${(png.length / 1024).toFixed(1)} KB)`)
}

console.log('\nDone. Add to manifest.json if not already referenced.')
