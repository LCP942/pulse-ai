import { useId } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'

interface LineChartArtProps {
  className?: string
}

const LINE = 'M10,110 C 60,105 70,70 110,68 C 150,66 160,40 200,32 C 240,24 250,50 310,15'
const AREA = `${LINE} L310,140 L10,140 Z`

// Starts just before the card's own fade-in lands, so the two read as one move.
const DRAW_DELAY = 0.5
const DRAW_DURATION = 1.1
const KPI_DELAY = DRAW_DELAY + DRAW_DURATION + 0.25

const dots = [
  [10, 110],
  [110, 68],
  [200, 32],
  [310, 15],
]

/** Width of the wipe's soft edge, in viewBox units. */
const EDGE = 44

/**
 * One soft-edged wipe reveals line, fill and dots together, so they cannot
 * drift apart. Driving each separately means guessing how far along the curve
 * a given x sits — which lets the fill run ahead of the line and dots surface
 * before the stroke reaches them.
 */
const wipe: Variants = {
  hidden: { x1: -EDGE, x2: 0 },
  show: {
    x1: 320,
    x2: 320 + EDGE,
    transition: { duration: DRAW_DURATION, delay: DRAW_DELAY, ease: 'easeInOut' },
  },
}

const kpi: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 4 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, delay: KPI_DELAY, ease: 'backOut' },
  },
}

/** Scales about the shape's own centre rather than the SVG origin. */
const aboutSelf = { transformBox: 'fill-box', transformOrigin: 'center' } as const

/** Smooth glowing trend line with soft area fill — generative, no chart library. */
export function LineChartArt({ className }: LineChartArtProps) {
  const shouldReduceMotion = useReducedMotion()
  const uid = useId()
  const lineId = `${uid}-chart-line`
  const fillId = `${uid}-chart-fill`
  const glowId = `${uid}-chart-glow`
  const wipeId = `${uid}-chart-wipe`
  const sweepId = `${uid}-chart-sweep`
  // Without variants each element renders at its resting attributes, which is
  // already the finished chart.
  const v = (variants: Variants) => (shouldReduceMotion ? undefined : variants)

  return (
    // The negative top gives the KPI room to sit clear of the rising curve;
    // the drawing itself is width-constrained here, so it does not shrink.
    <svg viewBox="0 -14 320 154" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={lineId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
        </linearGradient>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Resting attributes are the fully-wiped state, so with no variants
            (reduced motion) the chart simply renders finished. */}
        <motion.linearGradient
          id={wipeId}
          gradientUnits="userSpaceOnUse"
          x1={320}
          y1="0"
          x2={320 + EDGE}
          y2="0"
          variants={v(wipe)}
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </motion.linearGradient>
        <mask id={sweepId}>
          <rect x="0" y="-14" width="320" height="154" fill={`url(#${wipeId})`} />
        </mask>
      </defs>
      <g mask={`url(#${sweepId})`}>
        <path d={AREA} fill={`url(#${fillId})`} />
        <path
          d={LINE}
          fill="none"
          stroke={`url(#${lineId})`}
          strokeWidth="3"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
        />
        {dots.map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={4}
            fill="#ffffff"
            filter={`url(#${glowId})`}
          />
        ))}
      </g>
      <motion.g style={aboutSelf} variants={v(kpi)}>
        <rect x="246" y="-8" width="52" height="21" rx="7" fill="#ffffff" fillOpacity="0.25" />
        <text
          x="272"
          y="6.5"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="12"
          fontWeight="600"
          fontFamily="inherit"
          className="select-none"
        >
          83%
        </text>
      </motion.g>
    </svg>
  )
}
