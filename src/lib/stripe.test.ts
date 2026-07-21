import { beforeEach, describe, expect, it, vi } from 'vitest'

const loadStripe = vi.hoisted(() => vi.fn())

vi.mock('@stripe/stripe-js', () => ({ loadStripe }))

describe('getStripePromise', () => {
  beforeEach(() => {
    vi.resetModules()
    loadStripe.mockReset()
  })

  it('does not load Stripe.js at import time — only the checkout should pay for it', async () => {
    await import('./stripe')

    expect(loadStripe).not.toHaveBeenCalled()
  })

  it('loads Stripe.js once and reuses the same promise', async () => {
    loadStripe.mockResolvedValue({})
    const { getStripePromise } = await import('./stripe')

    const first = getStripePromise()
    const second = getStripePromise()

    expect(loadStripe).toHaveBeenCalledTimes(1)
    expect(second).toBe(first)
  })

  it('resolves to null when the script cannot load, instead of rejecting', async () => {
    loadStripe.mockRejectedValue(new Error('blocked'))
    const { getStripePromise } = await import('./stripe')

    await expect(getStripePromise()).resolves.toBeNull()
  })
})
