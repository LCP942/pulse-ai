import { describe, expect, it } from 'vitest'
import { formatPrice } from './format'

describe('formatPrice', () => {
  it('renders whole dollars without decimals', () => {
    expect(formatPrice(199)).toBe('$199')
  })

  it('groups thousands', () => {
    expect(formatPrice(1234)).toBe('$1,234')
  })

  it('keeps cents when the price is not a whole dollar', () => {
    expect(formatPrice(79.5)).toBe('$79.50')
  })
})
