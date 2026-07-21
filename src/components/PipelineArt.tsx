import { motion, useReducedMotion } from 'motion/react'

interface PipelineArtProps {
  className?: string
}

/** The cards, in reading order: the alert, the two people it reaches, the action. */
const NODES = [
  { x: 20, y: 65, w: 56, h: 40 },
  { x: 130, y: 20, w: 60, h: 40 },
  { x: 130, y: 110, w: 60, h: 40 },
  { x: 244, y: 65, w: 56, h: 40 },
] as const

/** The cables. Each is a cubic that leaves and arrives horizontally, so it
 *  meets the card edges square instead of clipping their corners. */
const CABLES = [
  'M76,85 C100,85 106,40 130,40',
  'M76,85 C100,85 106,130 130,130',
  'M190,40 C214,40 220,85 244,85',
  'M190,130 C214,130 220,85 244,85',
] as const

/** Order the signals travel: down the top branch, then the bottom one. */
const SIGNAL_DELAY = [0, 0.5, 1.4, 1.9] as const
/** Length of the travelling signal, as a fraction of its cable. */
const SIGNAL = 0.16

/**
 * Alert, hand-off, action — the card's own subject, drawn as what it is: a
 * small graph. Nodes and links are a vocabulary no other art in the app uses,
 * so this cannot read as a repeat of anything.
 */
export function PipelineArt({ className }: PipelineArtProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <svg viewBox="0 0 320 170" aria-hidden="true" className={className}>
      <g fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.4">
        {CABLES.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {!shouldReduceMotion && (
        <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          {CABLES.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              initial={{ pathLength: SIGNAL, pathOffset: 0 }}
              // Stop at 1 - SIGNAL: past that the dash pattern wraps and the
              // signal's tail reappears at the start of the cable.
              animate={{ pathOffset: 1 - SIGNAL }}
              transition={{
                duration: 2.4,
                delay: SIGNAL_DELAY[i],
                repeat: Infinity,
                repeatDelay: 0.6,
                ease: 'easeInOut',
              }}
            />
          ))}
        </g>
      )}

      {/* Filled with the panel behind them, so the cables pass under the cards
          rather than through them. */}
      <g className="fill-secondary" stroke="currentColor" strokeWidth="1.6">
        {NODES.map((n, i) => (
          <rect key={i} x={n.x} y={n.y} width={n.w} height={n.h} rx="9" />
        ))}
      </g>
      <g fill="currentColor">
        {NODES.map((n, i) => (
          <g key={i}>
            <circle cx={n.x + 14} cy={n.y + 14} r="3.4" />
            <rect x={n.x + 22} y={n.y + 12} width={n.w - 34} height="4" rx="2" fillOpacity="0.45" />
            <rect x={n.x + 14} y={n.y + 23} width={n.w - 26} height="4" rx="2" fillOpacity="0.28" />
          </g>
        ))}
      </g>
    </svg>
  )
}
