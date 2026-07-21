import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

interface OrbitArtProps {
  className?: string
}

const rings = [
  { rx: 130, ry: 46, rotate: -18, opacity: 0.3, duration: 46 },
  { rx: 110, ry: 66, rotate: 32, opacity: 0.4, duration: 34 },
  { rx: 80, ry: 80, rotate: 0, opacity: 0.55, duration: 26 },
]

const satellites = [
  { ring: 0, angle: 20 },
  { ring: 1, angle: 200 },
  { ring: 2, angle: 110 },
]

/** A point on the unrotated ellipse — the ring's rotation is applied by the
    shared transform the satellite group carries. */
function pointOnRing(rx: number, ry: number, angleDeg: number) {
  const angle = (angleDeg * Math.PI) / 180
  return {
    x: 150 + rx * Math.cos(angle),
    y: 150 + ry * Math.sin(angle),
  }
}

/** Slow-turning orbit rings around a glowing core — generative, no image asset. */
export function OrbitArt({ className }: OrbitArtProps) {
  const shouldReduceMotion = useReducedMotion()
  const uid = useId()
  const glowId = `${uid}-orbit-glow`

  return (
    <svg
      viewBox="0 0 300 300"
      aria-hidden="true"
      className={cn('overflow-visible', className)}
    >
      <defs>
        {/* A tight filter region clips the blur's tail into a hard-edged
            polygon instead of letting it fade smoothly to nothing — the
            region needs to extend well past the shape on every side. */}
        <filter id={glowId} x="-400%" y="-400%" width="900%" height="900%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g fill="none" stroke="currentColor" strokeWidth="1">
        {rings.map((ring, i) => (
          <motion.ellipse
            key={i}
            cx="150"
            cy="150"
            rx={ring.rx}
            ry={ring.ry}
            opacity={ring.opacity}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            initial={{ rotate: ring.rotate }}
            animate={
              shouldReduceMotion ? { rotate: ring.rotate } : { rotate: ring.rotate + 360 }
            }
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: ring.duration, repeat: Infinity, ease: 'linear' }
            }
          />
        ))}
      </g>

      {satellites.map(({ ring, angle }, i) => {
        const { x, y } = pointOnRing(rings[ring].rx, rings[ring].ry, angle)
        const r = i === 1 ? 4 : 3
        return (
          // Same rotation as the ring the satellite sits on, so it stays glued
          // to the ellipse instead of floating at its initial position.
          <motion.g
            key={i}
            style={{ transformBox: 'view-box', transformOrigin: '50% 50%' }}
            initial={{ rotate: rings[ring].rotate }}
            animate={
              shouldReduceMotion
                ? { rotate: rings[ring].rotate }
                : { rotate: rings[ring].rotate + 360 }
            }
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: rings[ring].duration, repeat: Infinity, ease: 'linear' }
            }
          >
            {/* Steady core, always fully visible. */}
            <circle data-testid="satellite-core" cx={x} cy={y} r={r} fill="currentColor" />
            {/* Glow halo, breathing smoothly — first and last keyframe match so
                each loop picks up exactly where the last one left off, with no
                jump back to a harder-edged resting state. */}
            <motion.circle
              data-testid="satellite-aura"
              cx={x}
              cy={y}
              r={r}
              fill="currentColor"
              filter={`url(#${glowId})`}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 0.6, scale: 1 }
                  : { opacity: [0.3, 0.85, 0.3], scale: [0.85, 1.2, 0.85] }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0.6, ease: 'easeOut' }
                  : {
                      duration: 2.8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.45 + 0.2,
                    }
              }
            />
          </motion.g>
        )
      })}

      <circle cx="150" cy="150" r="14" fill="currentColor" opacity="0.15" />
      <circle cx="150" cy="150" r="6" fill="currentColor" filter={`url(#${glowId})`} />
    </svg>
  )
}
