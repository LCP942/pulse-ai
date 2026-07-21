import { motion, useReducedMotion } from 'motion/react'

interface HealthGaugeArtProps {
  className?: string
}

const CENTRE = { x: 160, y: 132 } as const
const RADIUS = 96
const TICK = { inner: 104, outer: 112 } as const
/** Where the needle settles, 0 = at risk (left), 1 = healthy (right). */
const SCORE = 0.72
/** Band edges along the dial, in the same 0..1 scale. */
const BANDS = [0, 0.4, 0.7, 1] as const
const BAND_OPACITY = [0.22, 0.45, 0.9] as const

/** 0 = the left end of the dial, 1 = the right end. */
const angleAt = (t: number) => Math.PI * (1 - t)
const pointAt = (t: number, radius = RADIUS) => ({
  x: CENTRE.x + radius * Math.cos(angleAt(t)),
  y: CENTRE.y - radius * Math.sin(angleAt(t)),
})

const f = (n: number) => n.toFixed(1)
/** Sweep flag 1: the dial always runs left to right, over the top. */
const arc = (from: number, to: number) => {
  const a = pointAt(from)
  const b = pointAt(to)
  return `M${f(a.x)},${f(a.y)} A${RADIUS},${RADIUS} 0 0 1 ${f(b.x)},${f(b.y)}`
}

/**
 * An account health dial: at risk on the left, healthy on the right, with the
 * needle swinging up to the score. Everything — bands, ticks, needle — is
 * derived from one centre and one radius, so the parts cannot drift out of
 * agreement with each other.
 *
 * The shape family (an arc with graduations) is used nowhere else in the app,
 * which is the point: it can't be mistaken for the chart on the landing page.
 */
export function HealthGaugeArt({ className }: HealthGaugeArtProps) {
  const shouldReduceMotion = useReducedMotion()
  const tip = pointAt(SCORE)
  const needleEnd = pointAt(SCORE, RADIUS - 12)
  // Drawn at the score, then rotated back to the dial's start and swung in.
  const travel = 180 * SCORE

  return (
    <svg viewBox="0 0 320 170" aria-hidden="true" className={className}>
      <g fill="none" strokeWidth="12">
        <path d={arc(0, 1)} stroke="currentColor" strokeOpacity="0.12" />
        {BAND_OPACITY.map((opacity, i) => (
          <path
            key={i}
            d={arc(BANDS[i], BANDS[i + 1])}
            stroke="currentColor"
            strokeOpacity={opacity}
          />
        ))}
      </g>

      <g stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const a = pointAt(t, TICK.inner)
          const b = pointAt(t, TICK.outer)
          return <line key={t} x1={f(a.x)} y1={f(a.y)} x2={f(b.x)} y2={f(b.y)} />
        })}
      </g>

      <motion.g
        initial={shouldReduceMotion ? undefined : { rotate: -travel }}
        animate={shouldReduceMotion ? undefined : { rotate: 0 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: `${CENTRE.x}px`, originY: `${CENTRE.y}px` }}
      >
        <line
          x1={CENTRE.x}
          y1={CENTRE.y}
          x2={f(needleEnd.x)}
          y2={f(needleEnd.y)}
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <circle cx={f(tip.x)} cy={f(tip.y)} r="6" fill="currentColor" />
      </motion.g>

      <circle cx={CENTRE.x} cy={CENTRE.y} r="7.5" fill="currentColor" />
      <circle
        cx={CENTRE.x}
        cy={CENTRE.y}
        r="14"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />
    </svg>
  )
}
