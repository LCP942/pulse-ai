/**
 * Rasterises the Pulse coin mark into every icon format browsers and app
 * launchers ask for.
 *
 *   npm run icons
 *
 * Sources of truth, both hand-edited:
 *   public/logo.svg     the full mark — everything shown large
 *   public/favicon.svg  its optically corrected cut for 16/32 px. Browsers
 *                       prefer this over the .ico and a tab is never bigger
 *                       than ~32 px, so the simplified art is what actually
 *                       ships to tabs; it is linked directly from index.html.
 *
 * Needs ImageMagick on the PATH (`winget install ImageMagick.ImageMagick`,
 * `brew install imagemagick`) — deliberately NOT an npm dependency: icon
 * conversion is a one-off chore, not something this app ships. Set MAGICK to
 * override the binary. Generated files are committed, so a plain
 * `npm run build` never needs any of this.
 */
import { execFile } from 'node:child_process'
import { mkdtemp, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const run = promisify(execFile)

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const magick = process.env.MAGICK ?? 'magick'

/** Coin colour, kept in step with the disc fill in favicon.svg. */
const BACKGROUND = '#0f1117'
/** Render the vectors well above any target size, then downsample. */
const DENSITY = 1536
/**
 * Q16 builds of ImageMagick emit 16-bit channels, which doubles icon weight
 * for no visible gain; -strip drops the colour profile and timestamp on top.
 */
const PNG_OUT = ['-depth', '8', '-strip', '-define', 'png:compression-level=9']

const full = join(publicDir, 'logo.svg')
const small = join(publicDir, 'favicon.svg')

const magickRun = async (args) => {
  try {
    await run(magick, args)
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(
        `ImageMagick not found (tried "${magick}"). Install it, or point MAGICK at the binary.`,
      )
    }
    throw error
  }
}

const report = async (name, dir = publicDir) => {
  const { size } = await stat(join(dir, name))
  console.log(`  ${name.padEnd(24)} ${(size / 1024).toFixed(1)} kB`)
}

/** The bare coin on transparency. */
const coin = async (source, size, name, dir = publicDir) => {
  await magickRun([
    '-background', 'none',
    '-density', String(DENSITY),
    source,
    '-resize', `${size}x${size}`,
    ...PNG_OUT,
    join(dir, name),
  ])
  await report(name, dir)
}

/**
 * The coin centred on an opaque square. Launchers apply their own mask, so
 * they need colour bleeding to the edges and the mark kept inside a safe
 * zone — `coverage` is the coin diameter as a fraction of the canvas.
 */
const platformIcon = async (size, coverage, name) => {
  await magickRun([
    '-background', 'none',
    '-density', String(DENSITY),
    full,
    '-resize', `${Math.round(size * coverage)}x${Math.round(size * coverage)}`,
    '-background', BACKGROUND,
    '-gravity', 'center',
    '-extent', `${size}x${size}`,
    // iOS composites any transparency to black, so flatten it away.
    '-alpha', 'remove',
    '-alpha', 'off',
    ...PNG_OUT,
    join(publicDir, name),
  ])
  await report(name)
}

console.log('logo.svg + favicon.svg ->')

// Tab icons. Below ~24 px the full mark loses its facets, so those sizes come
// from the optically corrected cut. They only exist to be packed into the
// .ico — nothing references the standalone PNGs, so they stay out of public/.
const tmp = await mkdtemp(join(tmpdir(), 'pulse-icons-'))
try {
  await coin(small, 16, 'favicon-16.png', tmp)
  await coin(small, 32, 'favicon-32.png', tmp)
  await coin(full, 48, 'favicon-48.png', tmp)

  // The .ico still matters: it is what a bare /favicon.ico request and older
  // Windows browsers fall back to. ImageMagick packs the three PNGs as-is.
  await magickRun([
    join(tmp, 'favicon-16.png'),
    join(tmp, 'favicon-32.png'),
    join(tmp, 'favicon-48.png'),
    join(publicDir, 'favicon.ico'),
  ])
} finally {
  await rm(tmp, { recursive: true, force: true })
}
await report('favicon.ico')

// iOS home screen: Apple rounds the corners itself, so a flat square with
// padding is correct.
await platformIcon(180, 0.82, 'apple-touch-icon.png')

// PWA install icons, plus a maskable variant whose mark stays within the
// central 80% circle every launcher shape is guaranteed to keep.
await platformIcon(192, 0.84, 'icon-192.png')
await platformIcon(512, 0.84, 'icon-512.png')
await platformIcon(512, 0.72, 'icon-maskable-512.png')
