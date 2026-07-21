import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { Nav } from '@/components/Nav'
import { cn } from '@/lib/utils'

/** Children replace the routed Outlet — used by the router's errorElement,
    which renders outside the matched-route tree. */
export function Layout({ children }: { children?: ReactNode }) {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()
  const isLanding = location.pathname === '/'

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Resets scroll to the top on a fresh navigation (e.g. a "View
          pricing" CTA from the bottom of another page), while still
          restoring the exact position on refresh or back/forward. */}
      <ScrollRestoration />
      <Nav />
      <main className={cn('flex-1', !isLanding && 'pt-[88px]')}>
        {/* Enter-only fade: the outgoing page unmounts at once (no exit
            animation) so the two pages never overlap — a crossfade here
            double-exposes text on content-dense pages. `mode="wait"` with
            an instant exit also removes the blank frame that a fading-out
            exit used to leave behind. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' }}
          >
            {children ?? <Outlet />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
