import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { buttonVariants } from '@/components/ui/button'

const links = [
  { to: '/about', label: 'About' },
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/contact', label: 'Contact' },
]

export function Nav() {
  return (
    <header className="absolute inset-x-0 top-4 z-20 px-4 sm:px-6">
      {/* The bar is a single horizontal scroll strip: on screens too narrow
          to fit every item, the whole pill (logo included) scrolls sideways
          rather than crushing or wrapping its links. Every child is
          shrink-0/nowrap so overflow goes into the scrollable area. */}
      <nav
        aria-label="Main"
        className="scrollbar-none mx-auto flex max-w-screen-xl items-center gap-6 overflow-x-auto rounded-full border border-border/60 bg-background/15 py-3 pl-4 pr-3 shadow-sm backdrop-blur-[2px] sm:gap-8 sm:pl-6"
      >
        <NavLink
          to="/"
          className="flex shrink-0 items-center gap-2 font-heading text-lg font-semibold text-foreground"
          end
        >
          <Logo className="size-7 shrink-0" />
          Pulse
        </NavLink>
        <ul className="flex items-center gap-5 sm:gap-6">
          {links.map((link) => (
            <li key={link.to} className="shrink-0">
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground',
                    isActive && 'text-foreground',
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <NavLink
          to="/signup"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'ml-auto h-9 shrink-0 rounded-full border-border/50 bg-gradient-to-b from-background to-muted/70 px-4 font-normal whitespace-nowrap text-muted-foreground shadow-sm hover:text-foreground',
          )}
        >
          Sign Up
        </NavLink>
      </nav>
    </header>
  )
}
