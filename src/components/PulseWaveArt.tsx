import { useId } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { cn } from '@/lib/utils'

interface PulseWaveArtProps {
  className?: string
}

/**
 * The canvas is sized to the panel it sits in (~2:1). It used to be 320x100 —
 * a 3.2:1 strip — which `object-fit` letterboxed inside that panel: the beat
 * shrank to a thin band floating in dead space, which is why it read as
 * dropped onto the page rather than belonging to it.
 */
const VIEW = { w: 320, h: 170 } as const
const BASELINE = 95
/** Scales the beat to the taller canvas, so it fills it as it used to fill 100. */
const AMPLITUDE = 1.4

/** The beat, as (x, offset from the baseline). */
const BEAT: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [58, 0],
  [72, -32],
  [86, 34],
  [100, -42],
  [114, 0],
  [182, 0],
  [197, -16],
  [212, 16],
  [227, 0],
  [VIEW.w, 0],
]

const LINE = BEAT.map(
  ([x, dy], i) => `${i === 0 ? 'M' : 'L'}${x},${(BASELINE + dy * AMPLITUDE).toFixed(1)}`,
).join(' ')

/** Verticals and horizontals that give the trace something to sit against. */
const GRID = { x: [40, 120, 200, 280], y: [39, 151] } as const

const DRAW_DELAY = 0.3
const DRAW_DURATION = 1.2

/** Width of the wipe's soft edge, in viewBox units. */
const EDGE = 40

const wipe: Variants = {
  hidden: { x1: -EDGE, x2: 0 },
  show: {
    x1: 320,
    x2: 320 + EDGE,
    transition: { duration: DRAW_DURATION, delay: DRAW_DELAY, ease: 'easeInOut' },
  },
}

const pulse: Variants = {
  hidden: { opacity: 0.5, scale: 1 },
  show: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.15, 1],
    transition: {
      duration: 1.6,
      delay: DRAW_DELAY + DRAW_DURATION,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

/** A heartbeat-style pulse line, the brand's namesake — generative, no image asset. */
export function PulseWaveArt({ className }: PulseWaveArtProps) {
  const shouldReduceMotion = useReducedMotion()
  const uid = useId()
  const glowId = `${uid}-pulse-glow`
  const wipeId = `${uid}-pulse-wipe`
  const sweepId = `${uid}-pulse-sweep`
  const v = (variants: Variants) => (shouldReduceMotion ? undefined : variants)

  return (
    // overflow-visible: the end dot is centered exactly on the viewBox's
    // right edge — default svg clipping would cut it to a half circle.
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      aria-hidden="true"
      className={cn('overflow-visible', className)}
    >
      <defs>
        {/* The region is sized against each primitive's bounding box: the
            r=5 end dot's box is 10x10, so anything tighter than these
            margins squares off its gaussian halo. */}
        <filter id={glowId} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <motion.linearGradient
          id={wipeId}
          gradientUnits="userSpaceOnUse"
          x1={VIEW.w}
          y1="0"
          x2={VIEW.w + EDGE}
          y2="0"
          variants={v(wipe)}
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </motion.linearGradient>
        <mask id={sweepId}>
          <rect x="0" y="0" width={VIEW.w} height={VIEW.h} fill={`url(#${wipeId})`} />
        </mask>
      </defs>
      <g stroke="currentColor" strokeOpacity="0.09">
        {GRID.x.map((x) => (
          <line key={x} x1={x} y1="8" x2={x} y2={VIEW.h - 8} />
        ))}
        {GRID.y.map((y) => (
          <line key={y} x1="0" y1={y} x2={VIEW.w} y2={y} />
        ))}
      </g>
      <line
        x1="0"
        y1={BASELINE}
        x2={VIEW.w}
        y2={BASELINE}
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeDasharray="3 4"
      />
      <g mask={`url(#${sweepId})`}>
        <path
          d={LINE}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${glowId})`}
        />
      </g>
      <motion.circle
        cx={VIEW.w}
        cy={BASELINE}
        r="5"
        fill="currentColor"
        filter={`url(#${glowId})`}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        variants={v(pulse)}
      />
    </svg>
  )
}
