import { useId } from 'react'
import { useReducedMotion } from 'motion/react'
import { CASCADE_MASK_BOX, CASCADE_PLATES, CASCADE_VIEW_BOX } from './cascadeEchoPaths'

interface CascadeEchoArtProps {
  className?: string
}

/** How long the highlight takes to cross the whole cascade, in seconds. */
const SWEEP_DURATION = 3.4
/** Width of the highlight band, as a fraction of the sweep's travel. */
const BAND = 0.22

/**
 * The hero's plate cascade, flattened. The landing opens on the cascade in 3D
 * and closes on its echo in 2D — the same object, not a drawing of it: the
 * outlines are projected from the scene's own geometry through its own camera
 * (see 3d/export_cascade_echo.py, which emits cascadeEchoPaths.ts).
 *
 * A highlight sweeps bottom-left to top-right across the plate EDGES only. The
 * fill lives in its own layer that the sweep's mask never touches, so the plate
 * interiors cannot light up — by construction, not by tuning.
 */
export function CascadeEchoArt({ className }: CascadeEchoArtProps) {
  const shouldReduceMotion = useReducedMotion()
  const uid = useId()

  const plateId = (i: number) => `${uid}-plate-${i}`
  const occlId = (i: number) => `${uid}-occl-${i}`
  const shineId = `${uid}-shine`
  const shineMaskId = `${uid}-shine-mask`

  const [vx, vy, vw, vh] = CASCADE_VIEW_BOX.split(' ').map(Number)
  // The band runs along the cascade's own diagonal, and starts and ends clear
  // of the frame so no edge is lit when it appears or leaves.
  const span = { x: vw * (1 + BAND * 2), y: -vh * (1 + BAND * 2) }
  const from = { x: vx - vw * BAND, y: vy + vh * (1 + BAND) }

  return (
    <svg
      viewBox={CASCADE_VIEW_BOX}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
    >
      <defs>
        {CASCADE_PLATES.map((d, i) => (
          <path key={i} id={plateId(i)} d={d} />
        ))}
        {/* Painter's order runs far -> near, so the plates AFTER this one are
            the ones in front of it: subtract them, or the outlines cross. */}
        {CASCADE_PLATES.map((_, i) => (
          <mask key={i} id={occlId(i)} maskUnits="userSpaceOnUse" {...CASCADE_MASK_BOX}>
            <rect {...CASCADE_MASK_BOX} fill="#fff" />
            {CASCADE_PLATES.slice(i + 1).map((_, j) => (
              <use key={j} href={`#${plateId(i + 1 + j)}`} fill="#000" />
            ))}
          </mask>
        ))}
        {!shouldReduceMotion && (
          <>
            <linearGradient
              id={shineId}
              gradientUnits="userSpaceOnUse"
              x1={from.x}
              y1={from.y}
              x2={from.x + span.x * BAND}
              y2={from.y + span.y * BAND}
            >
              <stop offset="0" stopColor="#000" />
              <stop offset="0.5" stopColor="#fff" />
              <stop offset="1" stopColor="#000" />
              {(
                [
                  ['x1', from.x, from.x + span.x],
                  ['y1', from.y, from.y + span.y],
                  ['x2', from.x + span.x * BAND, from.x + span.x * (1 + BAND)],
                  ['y2', from.y + span.y * BAND, from.y + span.y * (1 + BAND)],
                ] as const
              ).map(([attr, a, b]) => (
                <animate
                  key={attr}
                  attributeName={attr}
                  values={`${a.toFixed(0)};${b.toFixed(0)}`}
                  dur={`${SWEEP_DURATION}s`}
                  repeatCount="indefinite"
                />
              ))}
            </linearGradient>
            <mask id={shineMaskId} maskUnits="userSpaceOnUse" {...CASCADE_MASK_BOX}>
              <rect {...CASCADE_MASK_BOX} fill={`url(#${shineId})`} />
            </mask>
          </>
        )}
      </defs>

      {/* The interiors. Painted first, and never handed to the sweep. */}
      <g fill="currentColor" fillOpacity="0.1" stroke="none">
        {CASCADE_PLATES.map((_, i) => (
          <use key={i} href={`#${plateId(i)}`} mask={`url(#${occlId(i)})`} />
        ))}
      </g>
      {/* The edges at rest. */}
      <g fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="3">
        {CASCADE_PLATES.map((_, i) => (
          <use key={i} href={`#${plateId(i)}`} mask={`url(#${occlId(i)})`} />
        ))}
      </g>
      {/* The same edges at full brightness, revealed only under the band. */}
      {!shouldReduceMotion && (
        <g mask={`url(#${shineMaskId})`}>
          <g fill="none" stroke="currentColor" strokeWidth="4.5">
            {CASCADE_PLATES.map((_, i) => (
              <use key={i} href={`#${plateId(i)}`} mask={`url(#${occlId(i)})`} />
            ))}
          </g>
        </g>
      )}
    </svg>
  )
}
