import { Navigate, useSearchParams } from 'react-router'
import { ConfirmationCard } from '@/components/ConfirmationCard'
import { formatPrice } from '@/lib/format'
import { billingFrom, pricingTiers, totalFor } from '@/data/pricingTiers'

export default function Confirmation() {
  const [searchParams] = useSearchParams()
  const tier = pricingTiers.find((candidate) => candidate.id === searchParams.get('tier'))
  const billing = billingFrom(searchParams)

  if (!tier) {
    return <Navigate to="/pricing" replace />
  }

  return (
    <section className="mx-auto max-w-[480px] px-4 py-16 sm:px-6">
      <title>Order confirmed — Pulse</title>
      <ConfirmationCard
        name={tier.name}
        price={totalFor(tier, billing)}
        note={
          billing === 'annual'
            ? `${formatPrice(tier.annualPrice)}/mo billed annually`
            : undefined
        }
      />
    </section>
  )
}
