import { useId } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'

interface ConstellationArtProps {
  className?: string
}

const nodes: Array<[number, number]> = [
  [40, 130],
  [90, 60],
  [150, 100], // centre — the glow route ends here, under the star
  [210, 50],
  [260, 120],
  [190, 160],
  [100, 170],
]

const edges: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [2, 5],
  [5, 6],
  [6, 0],
  [2, 4],
]

/**
 * The glow's route: nodes 7 → 0 → 1 → centre, which follows existing edges
 * rather than cutting across the network, and ends inside the star.
 */
const GLOW_ROUTE = 'M100,170 L40,130 L90,60 L150,100'
const GLOW_DELAY = 0.6
const GLOW_DURATION = 1.7
/** Length of the travelling comet, as a fraction of the route. */
const SEGMENT = 0.18
const ARRIVAL = GLOW_DELAY + GLOW_DURATION

const comet: Variants = {
  hidden: { pathLength: SEGMENT, pathOffset: 0, opacity: 0 },
  show: {
    pathLength: SEGMENT,
    pathOffset: 1 - SEGMENT,
    // Fades in as it leaves and out as it reaches the star, so it dissolves
    // into the sparkle instead of stopping dead.
    opacity: [0, 1, 1, 0],
    transition: {
      pathOffset: { duration: GLOW_DURATION, delay: GLOW_DELAY, ease: 'easeInOut' },
      opacity: { duration: GLOW_DURATION, delay: GLOW_DELAY, times: [0, 0.1, 0.82, 1] },
    },
  },
}

const star: Variants = {
  hidden: { scale: 1 },
  show: {
    scale: [1, 1.35, 1],
    transition: { duration: 0.7, delay: ARRIVAL - 0.25, ease: 'easeOut' },
  },
}

const aboutSelf = { transformBox: 'fill-box', transformOrigin: 'center' } as const

/** Faint node/edge network with a glowing center — generative, no image asset. */
export function ConstellationArt({ className }: ConstellationArtProps) {
  const shouldReduceMotion = useReducedMotion()
  const uid = useId()
  const glowId = `${uid}-node-glow`
  const v = (variants: Variants) => (shouldReduceMotion ? undefined : variants)

  return (
    <svg viewBox="0 0 300 200" aria-hidden="true" className={className}>
      <defs>
        <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g stroke="currentColor" strokeOpacity="0.35" strokeWidth="1">
        {edges.map(([a, b], i) => {
          const [x1, y1] = nodes[a]
          const [x2, y2] = nodes[b]
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
      </g>
      <g fill="currentColor">
        {nodes.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={2.5} opacity={0.7} />
        ))}
      </g>
      {!shouldReduceMotion && (
        <motion.path
          d={GLOW_ROUTE}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
          variants={comet}
        />
      )}
      {/* Glowing sparkle at the center node */}
      <motion.g filter={`url(#${glowId})`} style={aboutSelf} variants={v(star)}>
        <path
          d="M150,80 L156,94 L170,100 L156,106 L150,120 L144,106 L130,100 L144,94 Z"
          fill="currentColor"
        />
      </motion.g>
    </svg>
  )
}
