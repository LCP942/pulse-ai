import { formatPrice } from '@/lib/format'

interface CheckoutSummaryProps {
  name: string
  price: number
  /** Billing context shown under the amount, e.g. "$159/mo billed annually". */
  note?: string
}

export function CheckoutSummary({ name, price, note }: CheckoutSummaryProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
      <span className="font-medium">{name}</span>
      <div className="text-right">
        <span className="text-lg font-bold">{formatPrice(price)}</span>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </div>
    </div>
  )
}
