import { useId } from 'react'

type LogoProps = {
  className?: string
  /** When set, the mark is exposed as an image with this accessible name. */
  title?: string
}

/**
 * The Pulse coin, seen face-on: milled rim, inner guide ring and a faceted
 * gem struck in the centre. The disc itself is left unfilled so the mark
 * picks up whatever it sits on — the same face is modelled in 3D on the coin
 * of the hero video (see 3d/scene.py).
 */
export function Logo({ className, title }: LogoProps) {
  const titleId = useId()

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      aria-labelledby={title ? titleId : undefined}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <circle cx="50" cy="50" r="46" fill="none" stroke="#6366f1" strokeWidth="3" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#3a3d6b" strokeWidth="1" />
      <polygon points="50,20 76,50 50,80 24,50" fill="#4338ca" />
      <polygon points="50,20 76,50 50,50" fill="#6366f1" />
      <polygon points="50,20 50,50 24,50" fill="#818cf8" />
    </svg>
  )
}
