import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { CONVERGENCE_TRACES, HUB } from './convergenceTraces'

interface ConvergenceArtProps {
  className?: string
}

/** Length of the travelling signal, as a fraction of its trace. */
const SIGNAL = 0.13

/**
 * Many signals, one recommendation: straight runs turn through a single rounded
 * elbow and converge on one point — the transit-map idiom. Every trace is
 * computed, never drawn: hand-written ones stopped short of the centre and read
 * as clutter. They fade outward so the eye is pulled to where they meet.
 */
export function ConvergenceArt({ className }: ConvergenceArtProps) {
  const shouldReduceMotion = useReducedMotion()
  const uid = useId()
  const fadeId = `${uid}-fade`
  const maskId = `${uid}-mask`

  return (
    <svg viewBox="0 0 300 300" aria-hidden="true" className={className}>
      <defs>
        <radialGradient id={fadeId} cx="50%" cy="50%" r="52%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.55" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id={maskId}>
          <rect width="300" height="300" fill={`url(#${fadeId})`} />
        </mask>
      </defs>

      <g mask={`url(#${maskId})`}>
        <g
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.42"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          {CONVERGENCE_TRACES.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {/* The signals running in. Still, they would just double the resting
            traces, so reduced motion drops them entirely. */}
        {!shouldReduceMotion && (
          <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            {CONVERGENCE_TRACES.map((d, i) => (
              <motion.path
                key={i}
                d={d}
                initial={{ pathLength: SIGNAL, pathOffset: 0 }}
                // Stop at 1 - SIGNAL: past that the dash pattern wraps and the
                // signal's tail reappears at the start of the trace.
                animate={{ pathOffset: 1 - SIGNAL }}
                transition={{
                  duration: 3,
                  delay: i * 0.45,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}
          </g>
        )}
      </g>

      <circle cx={HUB.x} cy={HUB.y} r="5.5" fill="currentColor" />
      <circle
        cx={HUB.x}
        cy={HUB.y}
        r="14"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.4"
      />
    </svg>
  )
}
