import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Landing from './Landing'

describe('Landing', () => {
  it('renders a headline and value proposition', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('only renders one CTA, which scrolls to the in-page How It Works section', () => {
    const { container } = render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    )

    expect(screen.getAllByRole('link', { name: /get started/i })).toHaveLength(1)
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute(
      'href',
      '#how-it-works',
    )
    expect(container.querySelector('#how-it-works')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /how it works/i }),
    ).toBeInTheDocument()
  })

  it('renders a big headline below the How It Works label', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    )

    expect(screen.getByText('Connect,')).toBeInTheDocument()
    expect(screen.getByText('Analyze,')).toBeInTheDocument()
    expect(screen.getByText('Recommend')).toBeInTheDocument()
  })

  it('renders the 4-step How It Works bento grid', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    )

    // Every step is a level-3 heading, so assistive tech hears the full
    // 4-step process — not just the cards that happen to have a title line.
    const steps = screen.getAllByRole('heading', { level: 3 })
    expect(steps.map((h) => h.textContent)).toEqual([
      'Step 1 — Connect',
      'Step 2 — Analyze',
      'Step 3 — Recommend',
      'Step 4 — Grow',
    ])
    expect(screen.getByText('Connect Stripe')).toBeInTheDocument()
    expect(screen.getByText('Grow with confidence')).toBeInTheDocument()
  })

  it('illustrates the analyze and grow steps with decorative photography', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    )

    const analyze = screen.getByTestId('analyze-photo')
    const grow = screen.getByTestId('grow-photo')

    expect(analyze).toHaveAttribute('src', '/how-it-works-analyze.webp')
    expect(grow).toHaveAttribute('src', '/how-it-works-grow.webp')
    // The card copy carries the meaning, so the photos stay out of the
    // accessibility tree rather than repeating it.
    expect(analyze).toHaveAttribute('alt', '')
    expect(grow).toHaveAttribute('alt', '')
  })

  it('renders customer testimonials', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 2, name: /customers/i })).toBeInTheDocument()
  })

  it('closes with a final CTA linking to pricing', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    )

    const cta = screen.getByRole('link', { name: /view pricing/i })
    expect(cta).toHaveAttribute('href', '/pricing')
  })
})
