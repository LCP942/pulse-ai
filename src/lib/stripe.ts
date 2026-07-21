import { loadStripe, type Stripe } from '@stripe/stripe-js'

// Stripe's well-known public test key, used as a zero-setup fallback (NFR8: the
// project must run with no required environment variables). Safe to hardcode —
// publishable keys are designed for client-side exposure.
const FALLBACK_TEST_PUBLISHABLE_KEY = 'pk_test_TYooMQauvdEDq54NiTphI7jx'

let stripePromise: Promise<Stripe | null> | undefined

/**
 * Loads Stripe.js on first call rather than at import time, so only the
 * checkout pays for the script — the router imports every page statically.
 * A failed load (offline, ad-blocker, CSP) resolves to null: `<Elements>`
 * accepts null and the pay button stays disabled, instead of an unhandled
 * rejection.
 */
export function getStripePromise(): Promise<Stripe | null> {
  stripePromise ??= loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || FALLBACK_TEST_PUBLISHABLE_KEY,
  ).catch(() => null)
  return stripePromise
}
