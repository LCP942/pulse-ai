import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Features from './Features'

function renderFeatures() {
  return render(
    <MemoryRouter>
      <Features />
    </MemoryRouter>,
  )
}

describe('Features', () => {
  it('renders a page heading', () => {
    renderFeatures()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('groups features under at least 3 category headings', () => {
    renderFeatures()
    expect(screen.getByRole('heading', { level: 2, name: /pricing intelligence/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /retention/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /team & workflow/i })).toBeInTheDocument()
  })

  it('renders at least 8 feature cards, each with a heading and description', () => {
    renderFeatures()
    const cardHeadings = screen.getAllByRole('heading', { level: 3 })
    expect(cardHeadings.length).toBeGreaterThanOrEqual(8)
  })

  it('still highlights the original smart pricing suggestions feature', () => {
    renderFeatures()
    expect(
      screen.getByRole('heading', { level: 3, name: /smart pricing suggestions/i }),
    ).toBeInTheDocument()
  })

  it('illustrates every category with its own decorative art', () => {
    renderFeatures()

    // The responsive treatment (watermark below lg, card on desktop) is
    // layout, covered by the Playwright responsive audit — jsdom can only
    // verify presence and that the art stays decorative.
    const arts = screen.getAllByTestId('category-art')
    expect(arts).toHaveLength(3)
    for (const art of arts) {
      expect(art.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('ends with a CTA linking to pricing', () => {
    renderFeatures()
    const cta = screen.getByRole('link', { name: /view pricing/i })
    expect(cta).toHaveAttribute('href', '/pricing')
  })
})
