/**
 * The geometry behind ConvergenceArt, kept apart from the component so both it
 * and its tests can read it.
 *
 * Every trace is COMPUTED, never drawn. The first attempt was hand-written and
 * its segments stopped at points like 162,144 — near the centre but never on
 * it, which read as clutter. Octilinear routing (four axes, four diagonals) is
 * what fixes that: each final segment lies on a ray through the hub, so it can
 * only land exactly there.
 */

/** Where every trace ends. */
export const HUB = { x: 150, y: 150 } as const

const EDGE = { min: 10, max: 290 } as const
/** Corner radius of the single elbow each trace turns through. */
const ELBOW = 11

type Edge = 'left' | 'right' | 'top' | 'bottom'
type Ray = readonly [number, number]

const D = Math.SQRT1_2

/**
 * One entry per approach ray. `from` is the edge the trace enters by, and is
 * stated rather than derived: derived, a trace could come in from the far side,
 * overshoot the hub and double back into it.
 */
const TRACES: ReadonlyArray<{ ray: Ray; approach: number; from: Edge }> = [
  { ray: [0, -1], approach: 70, from: 'left' },
  { ray: [D, -D], approach: 92, from: 'top' },
  { ray: [1, 0], approach: 112, from: 'bottom' },
  { ray: [D, D], approach: 84, from: 'right' },
  { ray: [0, 1], approach: 76, from: 'right' },
  { ray: [-D, D], approach: 96, from: 'bottom' },
  { ray: [-1, 0], approach: 102, from: 'top' },
  { ray: [-D, -D], approach: 80, from: 'left' },
]

/** The rays in use — one trace each, or they overlay into a single thick line. */
export const CONVERGENCE_RAYS: readonly Ray[] = TRACES.map((t) => t.ray)

const f = (n: number) => n.toFixed(1)

/** Straight run in from an edge, one rounded elbow, then the ray into the hub. */
function build({ ray, approach, from }: (typeof TRACES)[number]): string {
  const ax = HUB.x + ray[0] * approach
  const ay = HUB.y + ray[1] * approach
  const start =
    from === 'left'
      ? { x: EDGE.min, y: ay }
      : from === 'right'
        ? { x: EDGE.max, y: ay }
        : from === 'top'
          ? { x: ax, y: EDGE.min }
          : { x: ax, y: EDGE.max }

  const len = Math.hypot(ax - start.x, ay - start.y)
  const inX = (ax - start.x) / len
  const inY = (ay - start.y) / len

  const p1 = { x: ax - inX * ELBOW, y: ay - inY * ELBOW }
  const p2 = { x: ax - ray[0] * ELBOW, y: ay - ray[1] * ELBOW }

  return `M${f(start.x)},${f(start.y)}L${f(p1.x)},${f(p1.y)}Q${f(ax)},${f(ay)} ${f(p2.x)},${f(p2.y)}L${HUB.x},${HUB.y}`
}

export const CONVERGENCE_TRACES: readonly string[] = TRACES.map(build)
