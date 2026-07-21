import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { getStripePromise } from '@/lib/stripe'
import { formatPrice } from '@/lib/format'
import { CheckoutSummary } from '@/components/CheckoutSummary'
import { Button } from '@/components/ui/button'
import {
  billingFrom,
  pricingTiers,
  totalFor,
  type BillingPeriod,
  type PricingTier,
} from '@/data/pricingTiers'

const SIMULATED_PROCESSING_DELAY_MS = 1200

export default function Checkout() {
  const [searchParams] = useSearchParams()
  const tier = pricingTiers.find((candidate) => candidate.id === searchParams.get('tier'))
  const billing = billingFrom(searchParams)

  if (!tier) {
    return <Navigate to="/pricing" replace />
  }

  const total = totalFor(tier, billing)

  return (
    <section className="mx-auto max-w-[480px] px-4 py-16 sm:px-6">
      <title>Checkout — Pulse</title>
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Checkout</h1>
      <div className="mt-6">
        <CheckoutSummary
          name={tier.name}
          price={total}
          note={
            billing === 'annual'
              ? `${formatPrice(tier.annualPrice)}/mo billed annually`
              : 'Billed monthly'
          }
        />
      </div>
      <div className="mt-6">
        <Elements
          stripe={getStripePromise()}
          options={{
            mode: 'payment',
            amount: total * 100,
            currency: 'usd',
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#2f6fef',
                colorBackground: '#ffffff',
                colorText: '#0f172a',
                colorTextSecondary: '#64748b',
                colorDanger: '#dc2626',
                borderRadius: '10px',
                // No self-hosted family here: Stripe Elements render in an
                // iframe on Stripe's origin, which cannot load our local
                // fonts (that would need the Elements `fonts` option with a
                // reachable cssSrc).
                fontFamily: 'system-ui, sans-serif',
              },
            },
          }}
        >
          <CheckoutForm tier={tier} billing={billing} total={total} />
        </Elements>
      </div>
    </section>
  )
}

function CheckoutForm({
  tier,
  billing,
  total,
}: {
  tier: PricingTier
  billing: BillingPeriod
  total: number
}) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // navigate() acts on the router, not this component: if the visitor walks
  // away during the simulated processing delay, the stale timer would still
  // yank them to /confirmation. Only navigate while mounted.
  const isMounted = useRef(true)
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!stripe || !elements) return

    setIsSubmitting(true)
    setErrorMessage(null)

    const { error } = await elements.submit()
    if (error) {
      setErrorMessage(error.message ?? 'Please check your card details.')
      setIsSubmitting(false)
      return
    }

    // Simulated payment: real client-side validation above, but no real charge,
    // no PaymentIntent confirmation, and no backend call — see PRD "Honesty & Trust".
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_PROCESSING_DELAY_MS))
    if (!isMounted.current) return
    navigate(`/confirmation?tier=${tier.id}&billing=${billing}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      {errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
      <Button
        type="submit"
        disabled={!stripe || isSubmitting}
        aria-busy={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Processing…' : `Pay ${formatPrice(total)} — ${tier.name}`}
      </Button>
    </form>
  )
}
