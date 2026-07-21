import { describe, expect, it } from 'vitest'
import { billingFrom, totalFor, pricingTiers as tiers } from './pricingTiers'

describe('billing helpers', () => {
  it('parses the billing query param, defaulting to monthly', () => {
    expect(billingFrom(new URLSearchParams('billing=annual'))).toBe('annual')
    expect(billingFrom(new URLSearchParams('billing=weekly'))).toBe('monthly')
    expect(billingFrom(new URLSearchParams(''))).toBe('monthly')
  })

  it('computes the amount actually charged for each period', () => {
    const pro = tiers.find((t) => t.id === 'pro')!
    expect(totalFor(pro, 'monthly')).toBe(199)
    expect(totalFor(pro, 'annual')).toBe(159 * 12)
  })
})
import { pricingTiers } from './pricingTiers'

describe('pricingTiers', () => {
  it('exports exactly 3 tiers', () => {
    expect(pricingTiers).toHaveLength(3)
  })

  it('gives every tier an id, name, tagline, price, and feature list', () => {
    for (const tier of pricingTiers) {
      expect(tier.id).toEqual(expect.any(String))
      expect(tier.name).toEqual(expect.any(String))
      expect(tier.tagline).toEqual(expect.any(String))
      expect(tier.price).toEqual(expect.any(Number))
      expect(tier.features.length).toBeGreaterThan(0)
    }
  })

  it('gives every tier a lower annual (per-month) price than its monthly price', () => {
    for (const tier of pricingTiers) {
      expect(tier.annualPrice).toEqual(expect.any(Number))
      expect(tier.annualPrice).toBeLessThan(tier.price)
    }
  })

  it('marks exactly one tier as recommended', () => {
    const recommended = pricingTiers.filter((tier) => tier.recommended)
    expect(recommended).toHaveLength(1)
  })

  it('has unique ids', () => {
    const ids = pricingTiers.map((tier) => tier.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
