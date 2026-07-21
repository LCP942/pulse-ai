import { Fragment } from 'react'
import { motion, type Variants } from 'motion/react'

/** Generic fade-up-on-scroll reveal, shared by every marketing section. */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' as const, delay },
  }),
}

/**
 * Keyed off each element rather than a slice of the viewport, so that reveals
 * fire in document order. A viewport-slice threshold both inverted that order
 * and, for sections near the bottom of a tall page, left content below the
 * trigger line even scrolled to the end of the window: it never revealed.
 */
export const revealViewport = { once: true, amount: 0.25 } as const

export const titleContainer = {
  hidden: { lineHeight: 1.4 },
  show: {
    lineHeight: 1.05,
    transition: { duration: 0.5, ease: 'easeOut' as const, staggerChildren: 0.05 },
  },
}

export const titleWord = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
}

export const subtitleFade = {
  hidden: { opacity: 0, lineHeight: 1.9 },
  show: { opacity: 1, lineHeight: 1.56, transition: { duration: 0.5, ease: 'easeOut' as const, delay: 0.67 } },
}

/** Splits `text` into words that blur-fade in one after another. */
export function AnimatedWords({
  text,
  shouldReduceMotion,
  wordVariants = titleWord,
}: {
  text: string
  shouldReduceMotion: boolean | null
  wordVariants?: Variants
}) {
  const words = text.split(/\s+/).filter(Boolean)
  return words.map((word, index) => (
    <Fragment key={index}>
      <motion.span variants={shouldReduceMotion ? undefined : wordVariants} className="inline-block">
        {word}
      </motion.span>
      {index < words.length - 1 ? ' ' : ''}
    </Fragment>
  ))
}
