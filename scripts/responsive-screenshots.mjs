/**
 * Responsive audit: screenshots every route at six viewport widths and fails
 * (exit 1) if any page can scroll horizontally.
 *
 *   npm run screenshots            # server expected on localhost:5173
 *   SCREENSHOT_BASE_URL=... SCREENSHOT_OUT_DIR=... node scripts/responsive-screenshots.mjs
 */
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:5173'
const OUT_DIR = process.env.SCREENSHOT_OUT_DIR ?? 'screenshots'

const VIEWPORTS = [
  { name: '320-small-mobile', width: 320, height: 720 },
  { name: '375-iphone-se', width: 375, height: 812 },
  { name: '414-iphone-pro-max', width: 414, height: 896 },
  { name: '768-tablet-portrait', width: 768, height: 1024 },
  { name: '1024-tablet-landscape', width: 1024, height: 768 },
  { name: '1440-desktop', width: 1440, height: 900 },
]

const PAGES = [
  { name: 'landing', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'features', path: '/features' },
  { name: 'pricing', path: '/pricing' },
  { name: 'checkout', path: '/checkout?tier=pro' },
  { name: 'confirmation', path: '/confirmation?tier=pro' },
  { name: 'contact', path: '/contact' },
  { name: 'signup', path: '/signup' },
]

async function run() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch()
  const overflowReport = []

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      })
      const page = await context.newPage()

      for (const target of PAGES) {
        await page.goto(`${BASE_URL}${target.path}`, { waitUntil: 'load' })
        // Long enough for entrance animations (e.g. the pricing table's
        // bounce + shine, ~1.5s in) to settle before measuring overflow.
        await page.waitForTimeout(2200)

        const overflowX = await page.evaluate(() => {
          const doc = document.documentElement
          return doc.scrollWidth - doc.clientWidth
        })
        if (overflowX > 1) {
          overflowReport.push(
            `${target.name} @ ${viewport.width}px -> horizontal overflow of ${overflowX}px`,
          )
        }

        const fileName = `${target.name}_${viewport.name}.png`
        await page.screenshot({ path: path.join(OUT_DIR, fileName), fullPage: true })
        console.log(`saved ${fileName}${overflowX > 1 ? `  [OVERFLOW ${overflowX}px]` : ''}`)
      }

      await context.close()
    }
  } finally {
    await browser.close()
  }

  console.log('\n--- Overflow report ---')
  if (overflowReport.length === 0) {
    console.log('No horizontal overflow detected.')
    return
  }
  overflowReport.forEach((line) => console.log(line))
  // An audit that only logs can never fail a check — make overflow loud.
  process.exitCode = 1
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
