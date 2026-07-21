import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { PipelineArt } from './PipelineArt'

const motionPreference = vi.hoisted(() => ({ reduced: false }))

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => motionPreference.reduced,
}))

describe('PipelineArt', () => {
  // An inline reset at the end of a test leaks state when an assertion fails.
  afterEach(() => {
    motionPreference.reduced = false
  })

  it('stays out of the accessibility tree — it is decorative', () => {
    const { container } = render(<PipelineArt />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('wires four cards together — alert, two hand-offs, action', () => {
    const { container } = render(<PipelineArt />)

    expect(container.querySelectorAll('rect[rx="9"]')).toHaveLength(4)
  })

  it('runs a signal along every cable', () => {
    const { container } = render(<PipelineArt />)

    // One resting cable plus one travelling signal each.
    expect(container.querySelectorAll('path')).toHaveLength(8)
  })

  it('keeps the cards opaque so the cables pass behind them', () => {
    const { container } = render(<PipelineArt />)
    const cards = container.querySelector('rect[rx="9"]')?.parentElement

    // var() is not valid in an SVG presentation attribute — the fill must come
    // from CSS (a class) for the custom property to resolve.
    expect(cards).toHaveClass('fill-secondary')
    expect(cards).not.toHaveAttribute('fill')
  })

  it('drops the signals under reduced motion, keeping the wiring', () => {
    motionPreference.reduced = true
    const { container } = render(<PipelineArt />)

    expect(container.querySelectorAll('path')).toHaveLength(4)
    expect(container.querySelectorAll('rect[rx="9"]')).toHaveLength(4)
  })
})
