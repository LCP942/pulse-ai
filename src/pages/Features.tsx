import {
  Activity,
  BellRing,
  ChevronRight,
  History,
  LineChart,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { HealthGaugeArt } from '@/components/HealthGaugeArt'
import { PulseWaveArt } from '@/components/PulseWaveArt'
import { PipelineArt } from '@/components/PipelineArt'
import { cn } from '@/lib/utils'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

interface Category {
  index: string
  name: string
  description: string
  features: Feature[]
  /** Unique per category: a repeated art would read as filler. */
  art: (props: { className?: string }) => ReactNode
}

const categories: Category[] = [
  {
    index: '01',
    name: 'Pricing Intelligence',
    description: 'Turn Stripe data into price points you can defend in the boardroom.',
    art: PulseWaveArt,
    features: [
      {
        icon: Sparkles,
        title: 'Smart pricing suggestions',
        description: 'AI recommends optimal price points based on real usage data.',
      },
      {
        icon: LineChart,
        title: 'A/B pricing tests',
        description: 'Run pricing experiments on real traffic — no code required.',
      },
      {
        icon: TrendingUp,
        title: 'Revenue forecasting',
        description: "See next quarter's MRR before it happens.",
      },
    ],
  },
  {
    index: '02',
    name: 'Retention & Risk',
    description: "Know which accounts need attention before they're gone.",
    art: HealthGaugeArt,
    features: [
      {
        icon: ShieldAlert,
        title: 'Churn prediction',
        description: 'Spot at-risk accounts before they cancel, with time to act.',
      },
      {
        icon: Activity,
        title: 'Account health scoring',
        description: 'Every account scored 0–100, so your team knows who to call first.',
      },
      {
        icon: BellRing,
        title: 'Renewal alerts',
        description: 'Get pinged automatically before a contract lapses.',
      },
    ],
  },
  {
    index: '03',
    name: 'Team & Workflow',
    description: 'Bring pricing decisions into the tools your team already uses.',
    art: PipelineArt,
    features: [
      {
        icon: MessageSquare,
        title: 'Slack & email digests',
        description: 'Weekly pricing and churn signals delivered where your team works.',
      },
      {
        icon: Users,
        title: 'Role-based access',
        description: 'Give finance, sales, and product the views they need — nothing more.',
      },
      {
        icon: History,
        title: 'Audit trail',
        description: 'Every price change logged, with who approved it and why.',
      },
    ],
  },
]

function FeatureRow({ feature }: { feature: Feature }) {
  return (
    <div className="flex gap-4 border-t border-border/60 py-6 first:border-t-0 first:pt-0">
      <feature.icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
      <div>
        <h3 className="font-heading text-lg font-medium">{feature.title}</h3>
        <p className="mt-1 text-muted-foreground">{feature.description}</p>
      </div>
    </div>
  )
}

export default function Features() {
  return (
    <>
      <title>Features — Pulse</title>
      <section className="mx-auto max-w-screen-md px-4 pt-16 pb-14 text-center sm:px-6 sm:pt-24 sm:pb-20">
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          Features
        </span>
        <h1 className="text-fade-bottom mt-4 pb-2 font-heading text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl">
          Every pricing decision,
          <br />
          <span className="text-muted-foreground">backed by data</span>
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-lg text-muted-foreground">
          From the first pricing suggestion to the renewal alert that saves the
          account, Pulse covers the whole lifecycle of your MRR.
        </p>
      </section>

      {categories.map((category, i) => {
        const Art = category.art
        const artFirst = i % 2 === 1
        return (
          <section
            key={category.name}
            className="mx-auto max-w-screen-xl px-4 py-14 sm:px-6 sm:py-20"
          >
            <div className="relative isolate grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={cn(artFirst && 'lg:order-2')}>
                <span className="font-heading text-sm font-semibold text-primary/50">
                  {category.index}
                </span>
                <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  {category.name}
                </h2>
                <p className="mt-2 max-w-md text-muted-foreground">{category.description}</p>
                <div className="mt-6">
                  {category.features.map((feature) => (
                    <FeatureRow key={feature.title} feature={feature} />
                  ))}
                </div>
              </div>
              {/* Below lg, a stacked illustration card only added scroll — so
                  the art becomes a centered watermark spanning the whole
                  category block at low opacity (a right-anchored vignette
                  read as accidental), and returns to its own full-opacity
                  rounded card on desktop. */}
              <div
                data-testid="category-art"
                className={cn(
                  'pointer-events-none absolute inset-0 -z-10 flex items-center justify-center opacity-15',
                  'lg:pointer-events-auto lg:relative lg:inset-auto lg:z-auto lg:h-80 lg:overflow-hidden lg:rounded-2xl lg:bg-secondary lg:opacity-100',
                  artFirst && 'lg:order-1',
                )}
              >
                <div
                  aria-hidden="true"
                  className="glow-blob top-1/2 left-1/2 hidden h-56 w-56 -translate-x-1/2 -translate-y-1/2 lg:block"
                />
                <Art className="relative h-full max-h-80 w-full max-w-md text-primary lg:max-h-none lg:max-w-none lg:p-10" />
              </div>
            </div>
          </section>
        )
      })}

      <section className="relative overflow-hidden px-4 py-20 text-center sm:py-28">
        <div
          aria-hidden="true"
          className="glow-blob top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2"
        />
        <div className="relative mx-auto max-w-screen-md">
          <h2 className="font-heading text-3xl font-semibold text-balance sm:text-4xl">
            Ready to put these features to work?
          </h2>
          <Link
            to="/pricing"
            className={cn(
              'glow-primary mt-8 inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3',
              'text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]',
            )}
          >
            View pricing
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
