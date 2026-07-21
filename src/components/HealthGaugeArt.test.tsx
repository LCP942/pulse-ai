import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { HealthGaugeArt } from './HealthGaugeArt'

describe('HealthGaugeArt', () => {
  it('stays out of the accessibility tree — it is decorative', () => {
    const { container } = render(<HealthGaugeArt />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('draws a dial track plus the three health bands over it', () => {
    const { container } = render(<HealthGaugeArt />)

    expect(container.querySelectorAll('path')).toHaveLength(4)
  })

  it('graduates the dial from end to end', () => {
    const { container } = render(<HealthGaugeArt />)

    expect(container.querySelectorAll('line')).toHaveLength(6) // 5 ticks + needle
  })

  it('swings the needle in from the start of the dial, not from mid-dial', () => {
    const { container } = render(<HealthGaugeArt />)
    const lines = container.querySelectorAll('line')
    const needle = lines[lines.length - 1].parentElement as HTMLElement

    // The needle is drawn at SCORE = 0.72 and rotated back to t = 0 before the
    // swing-in. Distance from the dial start to the score is 180° × 0.72.
    const match = needle.style.transform.match(/rotate\((-?[\d.]+)deg\)/)
    expect(match).not.toBeNull()
    expect(Number(match![1])).toBeCloseTo(-129.6, 1)
  })

  it('leaves no gap between the bands — they are derived from shared edges', () => {
    const { container } = render(<HealthGaugeArt />)
    const [, ...bands] = [...container.querySelectorAll('path')].map((p) =>
      p.getAttribute('d'),
    )

    // Each band must start exactly where the previous one ended, or the dial
    // shows seams. The end point of a band is the last coordinate pair.
    const endOf = (d: string) => d.slice(d.lastIndexOf(' ') + 1)
    const startOf = (d: string) => d.slice(1, d.indexOf(' '))
    for (let i = 1; i < bands.length; i++) {
      expect(startOf(bands[i]!)).toBe(endOf(bands[i - 1]!))
    }
  })
})
