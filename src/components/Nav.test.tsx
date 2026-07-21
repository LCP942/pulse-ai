import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Nav } from './Nav'

describe('Nav', () => {
  it('renders a link to every content page', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Nav />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /^about$/i })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: /features/i })).toHaveAttribute(
      'href',
      '/features',
    )
    expect(screen.getByRole('link', { name: /^pricing$/i })).toHaveAttribute(
      'href',
      '/pricing',
    )
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute(
      'href',
      '/contact',
    )
  })

  it('marks the active route link with aria-current="page"', () => {
    render(
      <MemoryRouter initialEntries={['/pricing']}>
        <Nav />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /pricing/i })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: /features/i })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('pairs the wordmark with the coin logo in the home link', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Nav />
      </MemoryRouter>,
    )

    const home = screen.getByRole('link', { name: /pulse/i })

    expect(home).toHaveAttribute('href', '/')
    expect(home.querySelector('svg')).toBeInTheDocument()
  })

  it('lets the whole bar scroll horizontally on narrow screens', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Nav />
      </MemoryRouter>,
    )

    // jsdom has no layout, so assert the scroll-strip contract instead: the
    // bar itself is the scroll container (hidden scrollbar), and none of its
    // items are allowed to shrink or wrap — otherwise links get crushed
    // instead of overflowing into the scrollable area.
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('overflow-x-auto', 'scrollbar-none')

    const home = screen.getByRole('link', { name: /pulse/i })
    expect(home).toHaveClass('shrink-0')

    const signUp = screen.getByRole('link', { name: /sign up/i })
    expect(signUp).toHaveClass('shrink-0', 'whitespace-nowrap')

    for (const label of ['About', 'Features', 'Pricing', 'Contact']) {
      const link = screen.getByRole('link', { name: new RegExp(`^${label}$`, 'i') })
      expect(link).toHaveClass('whitespace-nowrap')
      expect(link.closest('li')).toHaveClass('shrink-0')
    }
  })

  it('renders within a semantic nav landmark', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Nav />
      </MemoryRouter>,
    )

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
