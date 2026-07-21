import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ConstellationArt } from './ConstellationArt'

const motionPreference = vi.hoisted(() => ({ reduced: false }))

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => motionPreference.reduced,
}))

describe('ConstellationArt', () => {
  afterEach(() => {
    motionPreference.reduced = false
  })

  it('stays out of the accessibility tree — it is decorative', () => {
    const { container } = render(<ConstellationArt />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('draws the network with one visible dot per node', () => {
    const { container } = render(<ConstellationArt />)
    const dots = [...container.querySelectorAll('circle')]

    expect(dots).toHaveLength(7)
    // A zero-radius circle is a dead node — every node must render.
    for (const dot of dots) {
      expect(Number(dot.getAttribute('r'))).toBeGreaterThan(0)
    }
  })

  it('centres the star sparkle on the node the glow route ends at', () => {
    const { container } = render(<ConstellationArt />)
    const star = [...container.querySelectorAll('path')].at(-1)!
    const ys = [...star.getAttribute('d')!.matchAll(/[ML]\d+,(\d+)/g)].map((m) => Number(m[1]))

    // The glow route ends at the centre node (150, 100); the star must not
    // sit offset below it.
    expect((Math.min(...ys) + Math.max(...ys)) / 2).toBe(100)
  })

  it('sends the travelling comet along the network in full motion', () => {
    const { container } = render(<ConstellationArt />)

    // The comet path plus the star path.
    expect(container.querySelectorAll('path')).toHaveLength(2)
  })

  it('drops the comet under reduced motion, keeping the network and star', () => {
    motionPreference.reduced = true
    const { container } = render(<ConstellationArt />)

    expect(container.querySelectorAll('path')).toHaveLength(1)
  })
})
