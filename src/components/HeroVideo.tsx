import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { preload } from 'react-dom'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

type HeroVideoProps = {
  className?: string
}

/**
 * Phones only. The hero is `object-cover`, so a viewport narrower than the
 * landscape cut's 1.9:1 crops it — harmlessly down to a tablet, but a phone
 * keeps just ~37% of the width and slices the coin in half. Complements
 * Tailwind's `sm` (≥640px), where the landscape cut and its object-position
 * take over.
 */
const PORTRAIT_QUERY = '(max-width: 639.98px)'

function usePortraitViewport() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(PORTRAIT_QUERY)
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    },
    () => window.matchMedia(PORTRAIT_QUERY).matches,
    () => false,
  )
}

/**
 * The hero background: the coin intro plays once, then hands off to a
 * perpetual loop of the plates alone. The two clips are rendered to join
 * exactly — the plates are in phase and the coin has already left the frame
 * — so the swap is invisible.
 *
 * Each is rendered in two framings rather than one cut cropped by CSS; the
 * portrait one re-aims the camera at the coin and keeps the plates at the
 * same scale (see 3d/README.md).
 */
export function HeroVideo({ className }: HeroVideoProps) {
  const shouldReduceMotion = useReducedMotion()
  const portrait = usePortraitViewport()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [introPlayed, setIntroPlayed] = useState(false)
  // Reduced motion never gets the intro: it is the one clip with real motion
  // in it, and it cannot be looped away.
  const showIntro = !shouldReduceMotion && !introPlayed

  const framing = portrait ? '-portrait' : ''
  const clip = showIntro ? 'hero-intro' : 'hero-loop'

  // The handoff only stays invisible if the loop is already fetched when the
  // intro ends — a cold load at that point shows a black gap.
  if (showIntro) {
    preload(`/hero-loop${framing}.mp4`, { as: 'video' })
  }

  // autoPlay can be silently refused (Low Power Mode, data-saver). If the
  // intro is denied, hand off to the loop: muted and near-still, it either
  // gets to play or sits as a poster — unlike a frozen intro.
  useEffect(() => {
    if (!showIntro) return
    videoRef.current?.play()?.catch(() => setIntroPlayed(true))
  }, [showIntro])

  return (
    <video
      // A fresh element per clip: playback position, readiness and autoplay
      // evaluation cannot leak from one source into the other.
      key={`${clip}${framing}`}
      ref={videoRef}
      data-testid="hero-video"
      aria-hidden="true"
      src={`/${clip}${framing}.mp4`}
      autoPlay={!shouldReduceMotion}
      loop={!showIntro}
      muted
      playsInline
      disablePictureInPicture
      onEnded={() => setIntroPlayed(true)}
      // A failed intro (404, stalled source) must not leave the hero frozen —
      // fall back to the loop rather than waiting for an onEnded that will
      // never fire.
      onError={() => setIntroPlayed(true)}
      // Inert: without this the wallpaper is still a <video>, so a right-click
      // over any bare part of the hero opens the native menu (loop, pause, PiP,
      // "save video as"…). Dropping it as a hit target sends the click through
      // to the page, which is the only thing here that should answer.
      className={cn('pointer-events-none', className)}
    />
  )
}
