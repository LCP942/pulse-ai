import { describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from './router'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

// Non-landing routes are code-split (route-level `lazy`), so their first
// render resolves asynchronously — assertions use findBy* on those paths.
describe('router', () => {
  it('renders the Landing page at /', () => {
    renderAt('/')
    expect(
      screen.getByRole('heading', { level: 1, name: /smarter pricing/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /how it works/i }),
    ).toBeInTheDocument()
  })

  it('renders the About page at /about', async () => {
    renderAt('/about')
    expect(
      await screen.findByRole('heading', { level: 1, name: /pricing shouldn't be/i }),
    ).toBeInTheDocument()
  })

  it('renders the Features page at /features', async () => {
    renderAt('/features')
    expect(
      await screen.findByRole('heading', { level: 3, name: /smart pricing suggestions/i }),
    ).toBeInTheDocument()
  })

  it('renders the Contact page at /contact', async () => {
    renderAt('/contact')
    expect(
      await screen.findByRole('heading', { level: 1, name: /talk to us/i }),
    ).toBeInTheDocument()
  })

  it('renders the Pricing page at /pricing', async () => {
    renderAt('/pricing')
    expect(
      await screen.findByRole('heading', { level: 1, name: /pricing/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('table', { name: /compare plans/i })).toBeInTheDocument()
  })

  it('redirects /checkout to /pricing when no tier is selected', async () => {
    renderAt('/checkout')
    expect(
      await screen.findByRole('heading', { level: 1, name: /pricing/i }),
    ).toBeInTheDocument()
  })

  it('redirects /confirmation to /pricing when no tier is selected', async () => {
    renderAt('/confirmation')
    expect(
      await screen.findByRole('heading', { level: 1, name: /pricing/i }),
    ).toBeInTheDocument()
  })

  it('renders the shared Nav on every route', async () => {
    renderAt('/features')
    expect(
      await screen.findByRole('heading', { level: 1, name: /every pricing decision/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('gives each route its own document title', async () => {
    renderAt('/pricing')
    await screen.findByRole('heading', { level: 1, name: /pricing/i })
    expect(document.title).toBe('Pricing — Pulse')

    cleanup()
    renderAt('/')
    expect(document.title).toBe('Pulse — AI Revenue Copilot for SaaS Pricing')

    cleanup()
    renderAt('/does-not-exist')
    expect(document.title).toBe('Page not found — Pulse')
  })

  it('renders a branded 404 page with the Nav for unknown paths', () => {
    renderAt('/does-not-exist')

    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to the landing page/i })).toHaveAttribute(
      'href',
      '/',
    )
  })
})
