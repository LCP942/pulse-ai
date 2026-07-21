import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { CascadeEchoArt } from './CascadeEchoArt'
import { CASCADE_PLATES } from './cascadeEchoPaths'

const motionPreference = vi.hoisted(() => ({ reduced: false }))

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => motionPreference.reduced,
}))

describe('CascadeEchoArt', () => {
  // An inline reset at the end of a test leaks state when an assertion fails.
  afterEach(() => {
    motionPreference.reduced = false
  })

  it('stays out of the accessibility tree — it is decorative', () => {
    const { container } = render(<CascadeEchoArt />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('draws every plate projected from the hero scene', () => {
    const { container } = render(<CascadeEchoArt />)

    expect(container.querySelectorAll('defs path')).toHaveLength(CASCADE_PLATES.length)
  })

  it('gives each plate a mask hiding the plates in front of it', () => {
    const { container } = render(<CascadeEchoArt />)

    // Without occlusion the outlines cross each other in Xs — a plate must
    // hide the ones nearer the camera, which are the later entries.
    const masks = container.querySelectorAll('mask[id*="occl"]')
    expect(masks).toHaveLength(CASCADE_PLATES.length)
    // The farthest plate is covered by every other one; the nearest by none.
    expect(masks[0].querySelectorAll('use')).toHaveLength(CASCADE_PLATES.length - 1)
    expect(masks[CASCADE_PLATES.length - 1].querySelectorAll('use')).toHaveLength(0)
  })

  it('sweeps the highlight over the edges only, never the fill', () => {
    const { container } = render(<CascadeEchoArt />)
    const masked = container.querySelector('g[mask*="shine"]')

    expect(masked).toBeInTheDocument()
    // Everything the shine reveals is stroke-only: a filled layer inside it
    // would let the plate interiors light up too.
    expect(masked?.querySelector('g')).toHaveAttribute('fill', 'none')
    expect(container.querySelector('animate')).toBeInTheDocument()
  })

  it('drops the sweep under reduced motion, keeping the still cascade', () => {
    motionPreference.reduced = true
    const { container } = render(<CascadeEchoArt />)

    expect(container.querySelector('g[mask*="shine"]')).not.toBeInTheDocument()
    expect(container.querySelector('animate')).not.toBeInTheDocument()
    expect(container.querySelectorAll('defs path')).toHaveLength(CASCADE_PLATES.length)
  })
})
