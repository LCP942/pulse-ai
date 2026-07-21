import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LineChartArt } from './LineChartArt'

describe('LineChartArt', () => {
  it('calls out the trend with a KPI badge', () => {
    render(<LineChartArt />)

    expect(screen.getByText('83%')).toBeInTheDocument()
  })

  it('stays out of the accessibility tree — it is decorative', () => {
    const { container } = render(<LineChartArt />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('namespaces its SVG ids so two instances cannot cross-reference', () => {
    const { container } = render(
      <>
        <LineChartArt />
        <LineChartArt />
      </>,
    )
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id)

    // The animated wipe gradient in particular must not drive the other
    // instance's mask.
    expect(ids.length).toBeGreaterThan(0)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
