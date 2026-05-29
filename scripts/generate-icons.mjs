/**
 * Generates PWA and browser icons from public/icon.svg.
 *
 * Requires ImageMagick (`magick`) to be available in PATH.
 * Usage:
 *   npm run generate:icons
 */

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const source = join(publicDir, 'icon.svg')

if (!existsSync(source)) {
  throw new Error(`Missing source icon: ${source}`)
}

const outputs = [
  ['-resize', '192x192', join(publicDir, 'icon-192.png')],
  ['-resize', '512x512', join(publicDir, 'icon-512.png')],
  ['-resize', '512x512', join(publicDir, 'icon-maskable-512.png')],
  ['-resize', '180x180', join(publicDir, 'apple-touch-icon.png')],
  ['-define', 'icon:auto-resize=64,48,32,16', join(publicDir, 'favicon.ico')],
]

for (const args of outputs) {
  const out = args.at(-1)
  execFileSync('magick', [source, ...args], { stdio: 'inherit' })
  console.log(`Created ${out}`)
}
