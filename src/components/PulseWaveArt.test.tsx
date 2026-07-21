import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { PulseWaveArt } from './PulseWaveArt'

describe('PulseWaveArt', () => {
  it('stays out of the accessibility tree — it is decorative', () => {
    const { container } = render(<PulseWaveArt />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('draws the heartbeat-style pulse line', () => {
    const { container } = render(<PulseWaveArt />)

    expect(container.querySelector('path')).toBeInTheDocument()
  })

  it('matches the ratio of the panel it sits in, so it is not letterboxed', () => {
    const { container } = render(<PulseWaveArt />)
    const [, , w, h] = container.querySelector('svg')!.getAttribute('viewBox')!.split(' ').map(Number)

    // The panel is roughly 2:1. At its old 3.2:1 the beat was letterboxed into
    // a thin band with dead space above and below it.
    expect(w / h).toBeLessThan(2.2)
  })

  it('lets the end dot and its glow render past the canvas edge', () => {
    const { container } = render(<PulseWaveArt />)

    // The end dot sits exactly on the viewBox's right edge: with default svg
    // clipping it renders as a half circle, and the glow filter needs a
    // region much larger than the dot's own bounding box or the gaussian
    // halo gets squared off. Assert the *bounds*, not the exact tuning —
    // the SVG default region is only -10% / 120%.
    expect(container.querySelector('svg')).toHaveClass('overflow-visible')
    const filter = container.querySelector('filter')!
    expect(Number.parseFloat(filter.getAttribute('x')!)).toBeLessThanOrEqual(-100)
    expect(Number.parseFloat(filter.getAttribute('width')!)).toBeGreaterThanOrEqual(300)
  })

  it('namespaces its SVG ids so two instances cannot cross-reference', () => {
    const { container } = render(
      <>
        <PulseWaveArt />
        <PulseWaveArt />
      </>,
    )
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id)

    expect(ids.length).toBeGreaterThan(0)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('anchors the beat on a baseline and a grid', () => {
    const { container } = render(<PulseWaveArt />)

    expect(container.querySelectorAll('line').length).toBeGreaterThan(1)
    expect(container.querySelector('line[stroke-dasharray]')).toBeInTheDocument()
  })
})
