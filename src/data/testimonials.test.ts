import { describe, expect, it } from 'vitest'
import { testimonials } from './testimonials'

describe('testimonials', () => {
  it('exports at least 3 testimonials', () => {
    expect(testimonials.length).toBeGreaterThanOrEqual(3)
  })

  it('gives every testimonial a quote, author, role, company, and photo', () => {
    for (const testimonial of testimonials) {
      expect(testimonial.quote).toEqual(expect.any(String))
      expect(testimonial.author).toEqual(expect.any(String))
      expect(testimonial.role).toEqual(expect.any(String))
      expect(testimonial.company).toEqual(expect.any(String))
      expect(testimonial.photo).toMatch(/^\/testimonials\/.+\.webp$/)
    }
  })

  it('has unique ids', () => {
    const ids = testimonials.map((testimonial) => testimonial.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
