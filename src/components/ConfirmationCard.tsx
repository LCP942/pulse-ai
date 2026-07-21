import { CheckCircle2 } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { formatPrice } from '@/lib/format'

interface ConfirmationCardProps {
  name: string
  price: number
  /** Billing context shown under the amount, e.g. "$159/mo billed annually". */
  note?: string
}

export function ConfirmationCard({ name, price, note }: ConfirmationCardProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center"
    >
      <CheckCircle2 aria-hidden="true" className="size-12 text-success" />
      <h1 className="font-heading text-2xl font-semibold">You're all set.</h1>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-medium">{name}</span>
        <span className="text-2xl font-bold">{formatPrice(price)}</span>
      </div>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
    </motion.div>
  )
}
