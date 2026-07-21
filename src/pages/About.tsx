import { useEffect, useRef, useState } from 'react'
import { ChevronRight, Sparkles } from 'lucide-react'
import { animate } from 'motion'
import { useInView, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'
import { ConvergenceArt } from '@/components/ConvergenceArt'
import { OrbitArt } from '@/components/OrbitArt'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const stats = [
  { target: 40, prefix: '$', suffix: 'M+', label: 'MRR tracked across customers' },
  { target: 1200, prefix: '', suffix: '+', label: 'Pricing recommendations shipped' },
  { target: 18, prefix: '', suffix: '%', label: 'Average MRR lift after adoption' },
]

function AnimatedStat({
  target,
  prefix = '',
  suffix = '',
  label,
}: {
  target: number
  prefix?: string
  suffix?: string
  label: string
}) {
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplay(target)
      return
    }
    if (!inView) return
    const controls = animate(0, target, {
      duration: 1.4,
      ease: 'easeOut',
      onUpdate: (value) => setDisplay(Math.round(value)),
    })
    return () => controls.stop()
  }, [inView, shouldReduceMotion, target])

  return (
    <div className="w-full px-6 py-6 text-center first:pt-0 sm:py-0">
      <p
        ref={ref}
        className="bg-gradient-to-br from-primary to-accent-glow bg-clip-text font-heading text-4xl font-semibold text-transparent tabular-nums sm:text-5xl"
      >
        {`${prefix}${display.toLocaleString('en-US')}${suffix}`}
      </p>
      <p data-testid="about-stat" className="mt-2 text-sm text-balance text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

const values = [
  {
    title: 'Clarity over guesswork',
    description:
      'Pricing decisions should be backed by data, not gut feeling or the loudest voice in the room.',
  },
  {
    title: 'Your data stays yours',
    description:
      'Read-only Stripe access, revocable anytime. We never sell or share customer data.',
  },
  {
    title: 'Built for founders',
    description:
      "We've run subscription businesses ourselves — every feature starts from a real pricing headache.",
  },
]

export default function About() {
  return (
    <>
      <title>About — Pulse</title>
      {/* overflow-x-clip: the hero glow blob is anchored to the right edge
          and would otherwise widen the page on narrow viewports. */}
      <section className="relative isolate mx-auto grid max-w-screen-xl grid-cols-1 items-center gap-10 overflow-x-clip px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            About Pulse
          </span>
          <h1 className="text-fade-right mt-4 pb-2 font-heading text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl">
            Pricing shouldn't be
            <br />
            <span className="text-muted-foreground">a guessing game.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Pulse turns your Stripe data into clear, confident pricing decisions —
            so you grow revenue without second-guessing every change.
          </p>
        </div>
        {/* Below lg, stacking the orbit under the text only added scroll — so
            it becomes a quiet low-opacity backdrop behind the hero copy,
            anchored to the right, and returns to its own full-opacity column
            on desktop. */}
        <div
          data-testid="hero-art"
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 flex items-center justify-end pr-2 lg:pointer-events-auto lg:relative lg:inset-auto lg:z-auto lg:justify-center lg:pr-0"
        >
          {/* Only the orbit is dimmed on phones — the aura keeps its desktop
              strength on every viewport. */}
          <div
            aria-hidden="true"
            className="glow-blob top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2"
          />
          <OrbitArt className="relative h-56 w-56 text-primary opacity-25 sm:h-64 sm:w-64 lg:h-80 lg:w-80 lg:opacity-100" />
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="flex flex-col items-center divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
          {stats.map((stat) => (
            <AnimatedStat key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-4 pb-20 sm:px-6 sm:pb-28">
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Our story
        </h2>
        <div className="mt-8 grid max-w-2xl grid-cols-[1.5rem_1fr] gap-x-6 gap-y-10">
          <div
            aria-hidden="true"
            className="relative col-start-1 row-span-2 row-start-1 mx-auto h-full w-px bg-gradient-to-b from-primary/50 via-primary/50 to-primary/10"
          />
          <div className="relative col-start-1 row-start-1 flex justify-center pt-1">
            <span className="relative flex size-2.5 rounded-full bg-primary ring-4 ring-background">
              <span className="absolute inset-0 rounded-full bg-primary/50 blur-[3px]" />
            </span>
          </div>
          <div className="col-start-2 row-start-1">
            <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              The problem
            </p>
            <p className="mt-2 text-lg text-muted-foreground">
              Pulse started after watching one too many subscription businesses
              leave money on the table — not from a lack of customers, but from
              pricing set once and never revisited. Every price change was a leap
              of faith: no data on who would churn, no read on what the market
              would bear.
            </p>
          </div>
          <div className="relative col-start-1 row-start-2 flex justify-center pt-1">
            <span className="relative flex size-2.5 rounded-full bg-primary ring-4 ring-background">
              <span className="absolute inset-0 rounded-full bg-primary/50 blur-[3px]" />
            </span>
          </div>
          <div className="col-start-2 row-start-2">
            <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              The fix
            </p>
            <p className="mt-2 text-lg text-muted-foreground">
              We built Pulse to close that gap. By analyzing real usage and
              billing data straight from Stripe, it turns pricing from a
              once-a-year guess into an ongoing, data-backed conversation — one
              recommendation at a time.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-md px-4 pb-20 text-center sm:px-6 sm:pb-28">
        <p aria-hidden="true" className="font-heading text-7xl leading-none text-primary/20">
          "
        </p>
        <h2 className="sr-only">Our mission</h2>
        <p className="-mt-6 font-heading text-2xl leading-snug font-medium text-balance sm:text-3xl">
          Give every subscription business the pricing intelligence that used to
          be reserved for companies with a full data science team.
        </p>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Growth should come from better decisions, not more guesswork.
        </p>
      </section>

      <section className="mx-auto max-w-screen-md px-4 pb-20 sm:px-6 sm:pb-28">
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          What we believe
        </h2>
        <div className="mt-8">
          <Separator />
          {values.map((value, index) => (
            <div key={value.title}>
              <div className="flex flex-col gap-2 py-8 sm:flex-row sm:gap-8">
                <span className="font-heading text-sm font-semibold text-primary/50 sm:w-10 sm:shrink-0">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="font-heading text-lg font-medium">{value.title}</h3>
                  <p className="mt-2 max-w-lg text-muted-foreground">{value.description}</p>
                </div>
              </div>
              <Separator />
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-20 text-center sm:py-28">
        <div
          aria-hidden="true"
          className="glow-blob top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 opacity-70"
        />
        <ConvergenceArt className="pointer-events-none absolute top-1/2 left-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 text-primary/10" />
        <div className="relative mx-auto max-w-screen-md">
          <h2 className="font-heading text-3xl font-semibold text-balance sm:text-4xl">
            Ready to see what Pulse recommends for you?
          </h2>
          <Link
            to="/pricing"
            className={cn(
              'glow-primary mt-8 inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3',
              'text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]',
            )}
          >
            See pricing
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
