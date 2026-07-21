import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from './router'

describe('Layout', () => {
  it('renders the shared Nav alongside the routed page content', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/features'] })
    render(<RouterProvider router={router} />)

    // /features is code-split: its chunk resolves asynchronously.
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
