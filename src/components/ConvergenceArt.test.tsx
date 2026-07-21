import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ConvergenceArt } from './ConvergenceArt'
import { CONVERGENCE_RAYS, CONVERGENCE_TRACES, HUB } from './convergenceTraces'

const motionPreference = vi.hoisted(() => ({ reduced: false }))

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => motionPreference.reduced,
}))

describe('ConvergenceArt', () => {
  afterEach(() => {
    motionPreference.reduced = false
  })

  it('stays out of the accessibility tree — it is decorative', () => {
    const { container } = render(<ConvergenceArt />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('lands every trace exactly on the hub', () => {
    // The whole point: hand-drawn traces ended near the centre but never on it,
    // which read as messy. Each one must close on the hub to the decimal.
    for (const d of CONVERGENCE_TRACES) {
      expect(d.endsWith(`L${HUB.x},${HUB.y}`)).toBe(true)
    }
  })

  it('gives each trace its own approach ray, so none doubles up on another', () => {
    // Two traces sharing a ray lie on top of each other near the hub and read
    // as one thick line.
    const rays = CONVERGENCE_RAYS.map(([x, y]) => `${x.toFixed(4)},${y.toFixed(4)}`)
    expect(new Set(rays).size).toBe(CONVERGENCE_RAYS.length)
  })

  it('draws a resting trace and a travelling signal for each ray', () => {
    const { container } = render(<ConvergenceArt />)

    expect(container.querySelectorAll('path')).toHaveLength(CONVERGENCE_TRACES.length * 2)
  })

  it('drops the travelling signals under reduced motion, keeping the traces', () => {
    motionPreference.reduced = true
    const { container } = render(<ConvergenceArt />)

    // The signals would just double the resting traces once static.
    expect(container.querySelectorAll('path')).toHaveLength(CONVERGENCE_TRACES.length)
  })

  it('fades the traces outward so the eye lands on the hub', () => {
    const { container } = render(<ConvergenceArt />)

    expect(container.querySelector('radialGradient')).toBeInTheDocument()
    expect(container.querySelector('g[mask]')).toBeInTheDocument()
  })
})
