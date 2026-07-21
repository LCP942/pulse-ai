import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { OrbitArt } from './OrbitArt'

describe('OrbitArt', () => {
  it('stays out of the accessibility tree — it is decorative', () => {
    const { container } = render(<OrbitArt />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('draws three orbit rings around a glowing core', () => {
    const { container } = render(<OrbitArt />)

    expect(container.querySelectorAll('ellipse')).toHaveLength(3)
  })

  it('pins each satellite to its ring — both carry the same rotation', () => {
    const { container } = render(<OrbitArt />)
    const ringRotations = [...container.querySelectorAll('ellipse')].map(
      (ring) => (ring as SVGEllipseElement).style.transform,
    )
    const satelliteRotations = [
      ...container.querySelectorAll('[data-testid="satellite-core"]'),
    ].map((core) => (core.parentElement as HTMLElement).style.transform)

    // The elliptical rings spin continuously; a satellite drawn at a fixed
    // point only stays on its ring if it shares the ring's transform.
    expect(ringRotations[0]).toContain('rotate')
    expect(satelliteRotations).toEqual(ringRotations)
  })

  it('gives each satellite a steady core plus a separately animated glow aura', () => {
    const { container } = render(<OrbitArt />)

    expect(container.querySelectorAll('[data-testid="satellite-core"]')).toHaveLength(3)
    const auras = container.querySelectorAll('[data-testid="satellite-aura"]')
    expect(auras).toHaveLength(3)
    for (const aura of auras) {
      expect(aura.getAttribute('filter')).toMatch(/^url\(#.*orbit-glow\)$/)
    }
  })

  it('namespaces its SVG ids so two instances cannot cross-reference', () => {
    const { container } = render(
      <>
        <OrbitArt />
        <OrbitArt />
      </>,
    )
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id)

    expect(ids.length).toBeGreaterThan(0)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
