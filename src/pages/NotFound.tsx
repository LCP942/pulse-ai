import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-screen-md flex-col items-start px-4 py-16 sm:px-6 sm:py-24">
      <title>Page not found — Pulse</title>
      <p className="font-heading text-7xl font-semibold text-primary/20">404</p>
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you're looking for doesn't exist or has moved. Everything
        Pulse has to show starts from the landing page.
      </p>
      <Link
        to="/"
        className={cn(
          'mt-8 inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3',
          'text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]',
        )}
      >
        Back to the landing page
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  )
}
