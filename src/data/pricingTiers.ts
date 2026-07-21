export interface PricingTier {
  id: string
  name: string
  tagline: string
  price: number
  annualPrice: number
  features: string[]
  recommended?: boolean
}

export type BillingPeriod = 'monthly' | 'annual'

/** Anything but an explicit `annual` is monthly — unknown values included. */
export function billingFrom(params: URLSearchParams): BillingPeriod {
  return params.get('billing') === 'annual' ? 'annual' : 'monthly'
}

/** The amount actually charged: one month, or twelve discounted months. */
export function totalFor(tier: PricingTier, billing: BillingPeriod): number {
  return billing === 'annual' ? tier.annualPrice * 12 : tier.price
}

export const pricingTiers: PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'For teams just starting to track MRR seriously.',
    price: 99,
    annualPrice: 79,
    features: ['Up to $10k MRR tracked', 'Monthly pricing suggestions', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'The plan most growing subscription businesses choose.',
    price: 199,
    annualPrice: 159,
    features: [
      'Up to $100k MRR tracked',
      'Real-time pricing suggestions',
      'Churn prediction',
      'A/B pricing tests',
    ],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For scaled teams who need control and support guarantees.',
    price: 349,
    annualPrice: 279,
    features: ['Unlimited MRR tracked', 'Everything in Pro', 'Dedicated success manager', 'SSO & audit logs'],
  },
]
