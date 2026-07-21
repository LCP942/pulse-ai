import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Testimonials } from './Testimonials'
import { testimonials } from '@/data/testimonials'

describe('Testimonials', () => {
  it('renders a heading introducing customer feedback', () => {
    render(<Testimonials />)
    expect(screen.getByRole('heading', { level: 2, name: /customers/i })).toBeInTheDocument()
  })

  it('renders every testimonial quote and author', () => {
    render(<Testimonials />)

    for (const testimonial of testimonials) {
      expect(screen.getByText(testimonial.quote)).toBeInTheDocument()
      expect(screen.getByText(testimonial.author)).toBeInTheDocument()
      // Exact string match: a RegExp built from data breaks (or matches the
      // wrong text) as soon as a company name contains a metacharacter.
      expect(
        screen.getByText(`${testimonial.role}, ${testimonial.company}`),
      ).toBeInTheDocument()
    }
  })

  it('shows a real photo of each customer', () => {
    render(<Testimonials />)

    for (const testimonial of testimonials) {
      const photo = screen.getByRole('img', { name: testimonial.author })
      expect(photo).toHaveAttribute('src', testimonial.photo)
    }
  })

  it('gives every testimonial the same card treatment', () => {
    render(<Testimonials />)
    const cards = testimonials.map(
      (testimonial) => screen.getByText(testimonial.quote).parentElement as HTMLElement,
    )

    // One shared class list — a card styled differently from its siblings
    // would stand out of the grid.
    const treatments = new Set(cards.map((card) => card.className))
    expect(treatments.size).toBe(1)
    expect([...treatments][0]).toContain('bg-card')
  })
})
