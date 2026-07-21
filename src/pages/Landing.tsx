import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { ChevronRight, Sparkles } from 'lucide-react'
import { animate } from 'motion'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'
import { CascadeEchoArt } from '@/components/CascadeEchoArt'
import { ConstellationArt } from '@/components/ConstellationArt'
import { HeroVideo } from '@/components/HeroVideo'
import { LineChartArt } from '@/components/LineChartArt'
import { Logo } from '@/components/Logo'
import { Testimonials } from '@/components/Testimonials'
import { cn } from '@/lib/utils'
import { AnimatedWords, reveal, revealViewport, subtitleFade, titleContainer } from '@/lib/motion'

/** Overlaps the tail of the first card's fade rather than waiting it out. */
const secondInRow = 0.65

// how-it-works reveals a beat later than the shared `revealViewport`: the
// negative bottom margin holds the trigger until each element has climbed
// higher into the viewport, so the reveal plays *during* the CTA's scroll
// animation instead of finishing before the scroll settles.
const howItWorksViewport = { once: true, amount: 0.25, margin: '0px 0px -22% 0px' } as const

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

const ctaBounce = {
  hidden: { scale: 0 },
  show: {
    scale: [0, 1.15, 1],
    transition: { duration: 0.5, times: [0, 0.6, 1], ease: 'easeOut' as const, delay: 0.79 },
  },
}

export default function Landing() {
  const shouldReduceMotion = useReducedMotion()

  // Scrolled fast, both rows land in view together and would otherwise reveal
  // at once, so the bottom row waits on the top one finishing rather than on
  // the viewport alone.
  const [topRowDone, setTopRowDone] = useState(false)
  const bottomRowRef = useRef<HTMLDivElement>(null)
  const bottomRowInView = useInView(bottomRowRef, revealViewport)
  const bottomRow = topRowDone && bottomRowInView ? 'show' : 'hidden'

  // Failsafe: when the page loads (or scroll is restored) already past the
  // top row, its whileInView never fires and the gate above would keep the
  // bottom row at opacity 0 forever. 1.6s covers the top row's legitimate
  // animation window without racing it.
  useEffect(() => {
    if (!bottomRowInView || topRowDone) return
    const id = setTimeout(() => setTopRowDone(true), 1600)
    return () => clearTimeout(id)
  }, [bottomRowInView, topRowDone])

  function handleScrollToHowItWorks(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    const target = document.getElementById('how-it-works')
    if (!target) return

    const offset = 88 // clears the sticky nav
    const targetY = target.getBoundingClientRect().top + window.scrollY - offset

    if (shouldReduceMotion) {
      window.scrollTo(0, targetY)
      return
    }

    animate(window.scrollY, targetY, {
      duration: 1.4,
      ease: [0.4, 0, 0.2, 1], // soft ease-in, quick settle — no abrupt start, no drag
      onUpdate: (value) => window.scrollTo({ top: value, behavior: 'instant' }),
    })
  }

  return (
    <>
      <title>Pulse — AI Revenue Copilot for SaaS Pricing</title>
      {/* Horizontal clipping only: on short phone heroes the CTA's glow
          reaches the section's bottom edge, and full overflow-hidden sliced
          it into a hard line there — vertical ink is free to fade out
          naturally instead. */}
      <section className="relative isolate flex min-h-[560px] flex-col overflow-x-clip sm:min-h-[680px] lg:min-h-[820px]">
        <HeroVideo className="absolute inset-0 -z-10 h-full w-full object-cover object-[45%_62%] sm:object-[68%_30%]" />
        <div
          aria-hidden="true"
          // Same fade character on every viewport. The `from-12%` solid base
          // is the one deviation from a plain two-stop gradient: the video's
          // own bottom row isn't quite the page background color, so a fade
          // that only reaches full opacity at the very last pixel leaves a
          // faint hard line where the clip ends — a short fully-opaque strip
          // at the bottom makes that boundary happen inside solid background.
          // -bottom-1: overhangs the section edge by 4px. At fractional
          // devicePixelRatios (125%/150% Windows scaling) the fade's and the
          // video's bottom edges can rasterize one device pixel apart,
          // leaving a hairline of unfaded video — the overhang (pure
          // background over the page background, so invisible itself)
          // guarantees the video's last rows stay covered.
          className="pointer-events-none absolute inset-x-0 -bottom-1 -z-10 h-36 bg-gradient-to-t from-background from-12% via-background/60 to-transparent lg:h-48"
        />
        <div className="relative mx-auto flex w-full max-w-screen-xl flex-1 flex-col px-4 py-10 text-left sm:px-6 sm:py-3.5">
          <motion.div
            variants={shouldReduceMotion ? undefined : container}
            initial={shouldReduceMotion ? undefined : 'hidden'}
            animate={shouldReduceMotion ? undefined : 'show'}
            className="flex flex-1 flex-col"
          >
            <div className="my-auto flex flex-col items-start gap-6 text-left">
              <motion.span
                variants={shouldReduceMotion ? undefined : item}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase"
              >
                <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
                <span className="font-bold text-foreground">AI Revenue</span>
                <span className="font-medium text-muted-foreground">Copilot</span>
              </motion.span>
              <motion.h1
                variants={shouldReduceMotion ? undefined : titleContainer}
                className="text-fade-right pb-4 font-heading text-5xl leading-[1.05] font-semibold text-balance sm:text-6xl"
              >
                <span className="text-foreground">
                  <AnimatedWords text="Smarter Pricing," shouldReduceMotion={shouldReduceMotion} />
                </span>
                <br />
                <span className="text-muted-foreground">
                  <AnimatedWords text="Powered by AI" shouldReduceMotion={shouldReduceMotion} />
                </span>
              </motion.h1>
              <motion.p
                variants={shouldReduceMotion ? undefined : subtitleFade}
                className="max-w-md text-lg text-muted-foreground"
              >
                Pulse analyzes your Stripe data to recommend better prices, predict
                churn before it happens, and forecast revenue — so you grow MRR
                without the guesswork.
              </motion.p>
              <motion.div
                variants={shouldReduceMotion ? undefined : ctaBounce}
                className="flex flex-wrap items-center gap-5"
              >
                <a
                  href="#how-it-works"
                  onClick={handleScrollToHowItWorks}
                  className={cn(
                    'glow-primary inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3',
                    'text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]',
                  )}
                >
                  Get started
                  <ChevronRight className="size-4" aria-hidden="true" />
                </a>
              </motion.div>
            </div>
            <motion.p
              variants={shouldReduceMotion ? undefined : item}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0 }}
              className="mt-2 border-l-2 border-border pl-3 text-xs text-muted-foreground"
            >
              Real Stripe Elements — not a mockup.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section
        id="how-it-works"
        // scroll-mt-22 = 88px, matching both the JS scroll offset above and
        // the nav clearance used by Layout (pt-[88px]).
        className="mx-auto max-w-screen-xl scroll-mt-22 px-4 py-16 sm:px-6 sm:py-24"
      >
        <motion.div
          initial={shouldReduceMotion ? undefined : 'hidden'}
          whileInView="show"
          viewport={howItWorksViewport}
          variants={shouldReduceMotion ? undefined : reveal}
          className="flex items-center justify-center gap-2"
        >
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          <h2 className="text-lg text-muted-foreground uppercase">How It Works</h2>
        </motion.div>
        <motion.div
          initial={shouldReduceMotion ? undefined : 'hidden'}
          whileInView="show"
          viewport={howItWorksViewport}
          variants={shouldReduceMotion ? undefined : titleContainer}
          transition={{ duration: 0.5, ease: 'easeOut', staggerChildren: 0.05, delay: 0.4 }}
          className="text-fade-bottom pb-4 text-center font-heading text-5xl leading-[1.05] font-semibold text-balance sm:text-6xl"
        >
          <span className="text-foreground">
            <AnimatedWords text="Connect, Analyze," shouldReduceMotion={shouldReduceMotion} />
          </span>
          <br />
          <span className="text-muted-foreground">
            <AnimatedWords text="Recommend" shouldReduceMotion={shouldReduceMotion} />
          </span>
        </motion.div>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-12">
          <motion.div
            initial={shouldReduceMotion ? undefined : 'hidden'}
            whileInView="show"
            viewport={howItWorksViewport}
            variants={shouldReduceMotion ? undefined : reveal}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent-glow p-8 text-primary-foreground sm:col-span-7 sm:p-10"
          >
            <div className="flex h-full flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-sm">
                <h3 className="text-xs font-semibold tracking-wider text-primary-foreground/70 uppercase">
                  Step 1 — Connect
                </h3>
                <p className="mt-2 font-heading text-2xl font-semibold">Connect Stripe</p>
                <p className="mt-2 text-sm text-primary-foreground/85">
                  Securely link your account in one click. Read-only, revoke anytime.
                </p>
              </div>
              <LineChartArt className="h-28 w-full shrink-0 lg:h-32 lg:w-56" />
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? undefined : 'hidden'}
            whileInView="show"
            viewport={howItWorksViewport}
            custom={secondInRow}
            variants={shouldReduceMotion ? undefined : reveal}
            // Last of the top row to land, so it gates the bottom one.
            onAnimationComplete={(definition) => {
              if (definition === 'show') setTopRowDone(true)
            }}
            className="relative isolate flex min-h-[320px] flex-col justify-end overflow-hidden rounded-2xl p-8 text-background sm:col-span-5 sm:p-10"
          >
            {/* Photo: Mario Gogh (unsplash.com/@mariogogh), Unsplash License. */}
            <img
              data-testid="analyze-photo"
              src="/how-it-works-analyze.webp"
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 -z-10 h-full w-full object-cover object-center brightness-110"
            />
            {/* This shot is already night-dark, so the scrim only has to anchor
                the copy at the bottom — any more and the room disappears. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-t from-foreground via-foreground/50 to-foreground/15"
            />
            {/* Brighter than the label on the flat cards: this one sits on a photo. */}
            <h3 className="text-xs font-semibold tracking-wider text-background/75 uppercase">
              Step 2 — Analyze
            </h3>
            <p className="mt-4 font-heading text-xl leading-snug font-medium sm:text-2xl">
              Pulse quietly reviews pricing, usage, and churn signals — around the
              clock, in the background.
            </p>
          </motion.div>

          <motion.div
            ref={bottomRowRef}
            initial={shouldReduceMotion ? undefined : 'hidden'}
            animate={shouldReduceMotion ? undefined : bottomRow}
            variants={shouldReduceMotion ? undefined : reveal}
            className="relative overflow-hidden rounded-2xl bg-secondary p-8 sm:col-span-5 sm:p-10"
          >
            <ConstellationArt className="pointer-events-none absolute inset-0 h-full w-full text-primary opacity-80" />
            <div className="relative">
              <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Step 3 — Recommend
              </h3>
              <p className="mt-20 font-heading text-lg font-semibold sm:mt-24 sm:text-xl">
                Get smart recommendations — see exactly which price changes grow
                MRR, and why.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? undefined : 'hidden'}
            animate={shouldReduceMotion ? undefined : bottomRow}
            custom={secondInRow}
            variants={shouldReduceMotion ? undefined : reveal}
            className="relative isolate flex min-h-[320px] flex-col justify-end overflow-hidden rounded-2xl p-8 text-background sm:col-span-7 sm:p-10"
          >
            {/* Photo: Mapbox (unsplash.com/@mapbox), Unsplash License. */}
            <img
              data-testid="grow-photo"
              src="/how-it-works-grow.webp"
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_40%]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-t from-foreground via-foreground/85 to-foreground/40"
            />
            <div className="max-w-md">
              <h3 className="text-xs font-semibold tracking-wider text-background/75 uppercase">
                Step 4 — Grow
              </h3>
              <p className="mt-2 font-heading text-2xl font-semibold">Grow with confidence</p>
              <p className="mt-2 text-sm text-background/85">
                Apply a price change in one click and watch it land — your whole
                team reading the same numbers, month over month.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Testimonials />

      <motion.section
        initial={shouldReduceMotion ? undefined : 'hidden'}
        whileInView="show"
        viewport={revealViewport}
        variants={shouldReduceMotion ? undefined : reveal}
        className="mx-auto max-w-screen-xl px-4 pb-16 sm:px-6 sm:pb-24"
      >
        <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent-glow px-8 py-16 text-primary-foreground sm:px-16 sm:py-20">
          <Logo className="pointer-events-none absolute -right-16 -bottom-24 -z-10 h-80 w-80 rotate-[-12deg] opacity-20 sm:h-[26rem] sm:w-[26rem]" />
          <CascadeEchoArt className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-primary-foreground opacity-30" />
          <div className="max-w-md">
            <h2 className="font-heading text-3xl font-semibold text-balance sm:text-4xl">
              Ready to price with confidence?
            </h2>
            <p className="mt-3 text-primary-foreground/85">
              See which plan fits your MRR and start turning your Stripe data
              into pricing decisions today.
            </p>
            <Link
              to="/pricing"
              className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground shadow-lg transition-transform hover:scale-[1.03]"
            >
              View pricing
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </motion.section>
    </>
  )
}
