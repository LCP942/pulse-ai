import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import About from './About'

describe('About', () => {
  it('renders a page heading and mission statement', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('tells the origin story behind Pulse', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: /our story/i })).toBeInTheDocument()
  })

  it('states the mission driving the product', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: /our mission/i })).toBeInTheDocument()
  })

  it('labels each step of the story so the timeline markers carry meaning', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    )

    expect(screen.getByText('The problem')).toBeInTheDocument()
    expect(screen.getByText('The fix')).toBeInTheDocument()
  })

  it('backs the story with a few key stats', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    )

    expect(screen.getAllByTestId('about-stat').length).toBeGreaterThanOrEqual(3)
  })

  it('lists the values guiding how Pulse builds the product', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: /what we believe/i })).toBeInTheDocument()
  })

  it('keeps the hero orbit art decorative — the copy carries the meaning', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    )

    // The responsive demotion (backdrop below lg, own column on desktop) is
    // layout, which jsdom cannot observe — it is covered by the Playwright
    // responsive audit (npm run screenshots). Here: the art exists once and
    // stays out of the accessibility tree.
    const art = screen.getByTestId('hero-art')
    expect(art.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('ends with a CTA linking to pricing', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    )

    const cta = screen.getByRole('link', { name: /see pricing/i })
    expect(cta).toHaveAttribute('href', '/pricing')
  })
})
