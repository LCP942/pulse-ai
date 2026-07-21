import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Check, Clock, Minus, ShieldCheck } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'
import { pricingTiers, type BillingPeriod, type PricingTier } from '@/data/pricingTiers'

const comparisonRows: {
  label: string
  basic: string | boolean
  pro: string | boolean
  enterprise: string | boolean
}[] = [
  { label: 'MRR tracked', basic: 'Up to $10k', pro: 'Up to $100k', enterprise: 'Unlimited' },
  { label: 'Pricing suggestions', basic: 'Monthly', pro: 'Real-time', enterprise: 'Real-time' },
  { label: 'Churn prediction', basic: false, pro: true, enterprise: true },
  { label: 'A/B pricing tests', basic: false, pro: true, enterprise: true },
  { label: 'Revenue forecasting', basic: false, pro: true, enterprise: true },
  { label: 'Support', basic: 'Email', pro: 'Email & chat', enterprise: 'Dedicated manager' },
  { label: 'SSO & audit logs', basic: false, pro: false, enterprise: true },
]

const faqItems: { question: string; answer: string }[] = [
  {
    question: 'Is there a free trial?',
    answer: 'Every plan includes a 14-day free trial — no credit card required to start.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes. Upgrade, downgrade, or cancel anytime from your account settings, no calls needed.',
  },
  {
    question: 'What happens if I go over my MRR limit?',
    answer: "We'll give you a heads up before anything changes — no surprise charges on your card.",
  },
  {
    question: 'Do you offer a discount for annual billing?',
    answer: 'Yes — paying annually saves you roughly 20% compared to paying monthly.',
  },
  {
    question: "What's your refund policy?",
    answer: "If Pulse isn't a fit, we'll refund your first payment within 30 days, no questions asked.",
  },
]

// The Pro column's tint only — the border is drawn once, by the measured
// overlay below: adding it here too produced a second, slightly offset blue
// outline running alongside the real one.
const proColumnTint = 'bg-primary/[0.045]'

function ComparisonCell({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check aria-label="Included" className="mx-auto size-4 text-primary" />
    ) : (
      <Minus aria-label="Not included" className="mx-auto size-4 text-muted-foreground/40" />
    )
  }
  return <span>{value}</span>
}

export default function Pricing() {
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const scrollerRef = useRef<HTMLDivElement>(null)
  const proCellRefs = useRef<Map<string, HTMLElement>>(new Map())
  const [proColumnRect, setProColumnRect] = useState<{ left: number; width: number } | null>(
    null,
  )
  const [cellOrigins, setCellOrigins] = useState<Record<string, number>>({})
  const [overlayOrigin, setOverlayOrigin] = useState(0)
  // The overlay ring lives outside the scroller (so its glow isn't clipped
  // by the scroll container), which means it doesn't move with the table
  // when narrow screens scroll it — tracked here to keep it glued to the
  // Pro column.
  const [scrollerScrollLeft, setScrollerScrollLeft] = useState(0)
  // The scroller only needs `overflow-x-auto` for narrow viewports where the
  // table itself is wider than the screen — it isn't needed during the brief
  // entrance bounce, and keeping it on for that window clipped the ring's
  // top/bottom and flashed a horizontal scrollbar, since a scaled-up cell's
  // ink overflow still counts as scrollable overflow even though transforms
  // don't affect layout.
  const [suppressScrollerOverflow, setSuppressScrollerOverflow] = useState(true)

  function registerProCell(key: string) {
    return (el: HTMLElement | null) => {
      if (el) proCellRefs.current.set(key, el)
      else proCellRefs.current.delete(key)
    }
  }

  function handleChoose(id: string) {
    // The billing period travels with the tier: the price shown here must be
    // the price checkout charges.
    navigate(`/checkout?tier=${id}&billing=${billingPeriod}`)
  }

  function price(tier: PricingTier) {
    return billingPeriod === 'annual' ? tier.annualPrice : tier.price
  }

  // Shared with every cell in the Pro column (plus the border overlay below)
  // so the whole card pops together on arrival as one piece, not its outline
  // and its content bouncing separately. Delayed a beat rather than firing
  // the instant the page appears, so it reads as a deliberate callout once
  // the visitor has actually landed, not part of the page loading in. Kept
  // in sync with the shine's own delay in index.css.
  //
  // The border/badge/shine must be visible at rest from the very first
  // frame — only the *scale* is delayed, starting and ending at 1 rather
  // than growing in from a smaller "hidden" state, which left the column
  // looking undecorated for that whole first second.
  const BOUNCE_DELAY_S = 1
  const bounceTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.45, delay: BOUNCE_DELAY_S, times: [0, 0.7, 1], ease: 'easeOut' as const }
  const bounceAnimate = { scale: shouldReduceMotion ? 1 : [1, 1.05, 1] }

  useEffect(() => {
    const timer = setTimeout(() => setSuppressScrollerOverflow(false), (BOUNCE_DELAY_S + 0.55) * 1000)
    return () => clearTimeout(timer)
  }, [])

  // On viewports narrower than the table, waiting out the bounce before
  // enabling `overflow-x-auto` would leave the whole page horizontally
  // scrollable for that first ~1.5s — there, scrolling containment matters
  // more than the ring staying unclipped, so overflow kicks in immediately.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (scroller && scroller.scrollWidth > scroller.clientWidth) {
      setSuppressScrollerOverflow(false)
    }
  }, [])

  // Every cell in the Pro column scales from its own box by default, which
  // — since they're stacked at different heights — drifts out of sync with
  // each other and with the border overlay: the whole thing reads as loose
  // pieces bouncing independently instead of one rigid card. Scaling from a
  // single shared pivot (the column's vertical center, in the scroller's
  // coordinate space) keeps every cell's distance from that point growing by
  // the same factor, the way zooming a single image would, so the column
  // moves as one unit. `offsetLeft`/`offsetTop` (relative to each element's
  // own positioned ancestor) are scroll-position-independent, unlike
  // subtracting two getBoundingClientRect calls, which drifts if the table
  // is horizontally scrolled at measurement time. A ResizeObserver
  // re-measures on any actual size change (e.g. the web font swapping in
  // after first paint) instead of only on window resize.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    function measure() {
      const header = proCellRefs.current.get('header')
      if (!header || !scroller) return

      setProColumnRect({
        left: scroller.offsetLeft + header.offsetLeft,
        width: header.offsetWidth,
      })

      const cells = Array.from(proCellRefs.current.values())
      const columnTop = Math.min(...cells.map((el) => el.offsetTop))
      const columnBottom = Math.max(...cells.map((el) => el.offsetTop + el.offsetHeight))
      const centerY = (columnTop + columnBottom) / 2

      const origins: Record<string, number> = {}
      for (const [key, el] of proCellRefs.current) {
        origins[key] = centerY - el.offsetTop
      }
      setCellOrigins(origins)
      setOverlayOrigin(centerY - 12) // 12 = the overlay's own `top-3` offset
    }
    measure()

    const observer = new ResizeObserver(measure)
    for (const el of proCellRefs.current.values()) observer.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <>
      <title>Pricing — Pulse</title>
      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24">
        <h1 className="font-heading text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Pricing
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
          Simple, transparent pricing. Start free, upgrade when Pulse pays for
          itself.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1">
            <button
              type="button"
              aria-pressed={billingPeriod === 'monthly'}
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                'cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                billingPeriod === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              aria-pressed={billingPeriod === 'annual'}
              onClick={() => setBillingPeriod('annual')}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                billingPeriod === 'annual'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Annual
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-semibold text-primary">
                Save 20%
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden="true" className="size-3.5 text-primary" />
              14-day free trial, no card required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck aria-hidden="true" className="size-3.5 text-primary" />
              30-day money-back guarantee
            </span>
          </div>
        </div>

        {/* Narrow screens get one self-contained card per tier instead of a
            sideways-scrolling 4-column table — the standard mobile pricing
            pattern: everything about a tier readable in one glance, Pro
            called out with the same badge/ring language as the table. */}
        <div data-testid="mobile-tiers" className="mt-10 flex flex-col gap-6 md:hidden">
          {pricingTiers.map((tier) => (
            // The Pro card keeps the table's entrance treatment — one bounce
            // plus the fill/border shines. A standalone card scales from its
            // own center, so none of the shared-pivot bookkeeping the table's
            // stacked cells need applies here.
            <motion.div
              key={tier.id}
              animate={tier.recommended ? bounceAnimate : undefined}
              transition={tier.recommended ? bounceTransition : undefined}
              className={cn(
                'relative rounded-2xl border border-border bg-card p-6 shadow-sm',
                tier.recommended && 'border-primary/30 bg-primary/[0.03] ring-2 ring-primary/70',
              )}
            >
              {tier.recommended && (
                <>
                  <div
                    aria-hidden="true"
                    className="pro-column-shine pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
                  />
                  <div
                    aria-hidden="true"
                    className="pro-column-border-shine pointer-events-none absolute inset-0 rounded-2xl"
                  />
                  <span className="absolute -top-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold whitespace-nowrap text-primary-foreground shadow-md">
                    Most Popular
                  </span>
                </>
              )}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-heading text-lg font-semibold">{tier.name}</p>
                  <p className="mt-1 max-w-[24ch] text-xs text-muted-foreground">{tier.tagline}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-3xl font-bold">${price(tier)}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  {billingPeriod === 'annual' && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Billed annually at {formatPrice(price(tier) * 12)}/yr
                    </p>
                  )}
                </div>
              </div>
              <ul className="mt-5 flex flex-col gap-2.5 border-t border-border/60 pt-5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={tier.recommended ? 'default' : 'outline'}
                onClick={() => handleChoose(tier.id)}
                className="mt-5 w-full"
              >
                Choose {tier.name}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* `overflow-x-clip` (not hidden: no scroll container, vertical ink
            like the badge and glow stays visible) keeps the absolutely
            positioned Pro overlay from widening the page on narrow screens
            where the table scrolls. */}
        <div className="relative mt-16 hidden overflow-x-clip md:block">
          <div
            aria-hidden="true"
            className="glow-blob top-0 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/3"
          />
          <div
            ref={scrollerRef}
            onScroll={(event) => setScrollerScrollLeft(event.currentTarget.scrollLeft)}
            className={cn(
              'relative pt-3',
              suppressScrollerOverflow ? 'overflow-visible' : 'overflow-x-auto',
            )}
          >
            <table
              aria-label="Compare plans"
              className="w-full min-w-[640px] border-separate border-spacing-0 text-sm"
            >
              <colgroup>
                <col className="w-[28%]" />
                <col className="w-[24%]" />
                <col className="w-[24%]" />
                <col className="w-[24%]" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="w-1/4" />
                  {pricingTiers.map((tier) => (
                    <motion.th
                      key={tier.id}
                      ref={tier.recommended ? registerProCell('header') : undefined}
                      scope="col"
                      className={cn(
                        'relative px-4 pt-6 pb-4 text-center align-bottom',
                        tier.recommended && proColumnTint,
                      )}
                      style={
                        tier.recommended
                          ? { transformOrigin: `50% ${cellOrigins.header ?? 0}px` }
                          : undefined
                      }
                      animate={tier.recommended ? bounceAnimate : undefined}
                      transition={tier.recommended ? bounceTransition : undefined}
                    >
                      <p className="font-heading text-lg font-semibold">{tier.name}</p>
                      <p className="mx-auto mt-1 max-w-[16ch] text-xs font-normal text-muted-foreground">
                        {tier.tagline}
                      </p>
                    </motion.th>
                  ))}
                </tr>
                <tr>
                  {/* Row header: it labels the price cells beside it. */}
                  <th scope="row" className="sr-only">
                    Price
                  </th>
                  {pricingTiers.map((tier) => (
                    <motion.td
                      key={tier.id}
                      ref={tier.recommended ? registerProCell('price') : undefined}
                      className={cn(
                        'px-4 pb-6 text-center',
                        tier.recommended && proColumnTint,
                      )}
                      style={
                        tier.recommended
                          ? { transformOrigin: `50% ${cellOrigins.price ?? 0}px` }
                          : undefined
                      }
                      animate={tier.recommended ? bounceAnimate : undefined}
                      transition={tier.recommended ? bounceTransition : undefined}
                    >
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold">${price(tier)}</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </div>
                      {billingPeriod === 'annual' && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Billed annually at {formatPrice(price(tier) * 12)}/yr
                        </p>
                      )}
                    </motion.td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="py-3 pr-4 text-left font-normal text-muted-foreground">
                      {row.label}
                    </th>
                    <td className="border-t border-border/60 px-4 py-3 text-center">
                      <ComparisonCell value={row.basic} />
                    </td>
                    <motion.td
                      ref={registerProCell(row.label)}
                      className={cn(
                        'border-t border-border/60 px-4 py-3 text-center',
                        proColumnTint,
                      )}
                      style={{ transformOrigin: `50% ${cellOrigins[row.label] ?? 0}px` }}
                      animate={bounceAnimate}
                      transition={bounceTransition}
                    >
                      <ComparisonCell value={row.pro} />
                    </motion.td>
                    <td className="border-t border-border/60 px-4 py-3 text-center">
                      <ComparisonCell value={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  {pricingTiers.map((tier) => (
                    <motion.td
                      key={tier.id}
                      ref={tier.recommended ? registerProCell('footer') : undefined}
                      className={cn(
                        'px-4 pt-4 pb-6 text-center align-top',
                        tier.recommended && proColumnTint,
                      )}
                      style={
                        tier.recommended
                          ? { transformOrigin: `50% ${cellOrigins.footer ?? 0}px` }
                          : undefined
                      }
                      animate={tier.recommended ? bounceAnimate : undefined}
                      transition={tier.recommended ? bounceTransition : undefined}
                    >
                      <Button
                        variant={tier.recommended ? 'default' : 'outline'}
                        onClick={() => handleChoose(tier.id)}
                        className="w-full"
                      >
                        Choose {tier.name}
                      </Button>
                    </motion.td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
          {proColumnRect && (
            <motion.div
              style={{
                left: proColumnRect.left - scrollerScrollLeft,
                width: proColumnRect.width,
                transformOrigin: `50% ${overlayOrigin}px`,
              }}
              className="pointer-events-none absolute top-3 bottom-0"
              animate={bounceAnimate}
              transition={bounceTransition}
            >
              {/* Fill sweep — blue/cyan, across the whole card. */}
              <div aria-hidden="true" className="pro-column-shine absolute inset-0 overflow-hidden rounded-xl" />
              {/* Resting outline. */}
              <div aria-hidden="true" className="absolute inset-0 rounded-xl ring-2 ring-primary/70" />
              {/* Same sweep again, masked to just the outline, in white. */}
              <div aria-hidden="true" className="pro-column-border-shine absolute inset-0 rounded-xl" />
              {/* Lives here rather than inside the (also scaling) header cell:
                  giving a table cell its own `transform` — needed for the
                  bounce — makes it a new stacking context, which trapped this
                  badge's z-index inside that cell instead of letting it beat
                  the ring/shine above. */}
              <span className="absolute -top-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold whitespace-nowrap text-primary-foreground shadow-md">
                Most Popular
              </span>
            </motion.div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-screen-md px-4 pb-20 sm:px-6 sm:pb-28">
        <h2 className="text-center font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
          {faqItems.map((item) => (
            <div key={item.question}>
              <p className="font-medium">{item.question}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
