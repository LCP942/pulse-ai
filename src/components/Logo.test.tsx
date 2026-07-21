import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Logo } from './Logo'

describe('Logo', () => {
  it('is decorative by default so adjacent wordmark text is not duplicated', () => {
    const { container } = render(<Logo />)
    const svg = container.querySelector('svg')

    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('exposes an accessible image when a title is given', () => {
    render(<Logo title="Pulse" />)

    expect(screen.getByRole('img', { name: 'Pulse' })).toBeInTheDocument()
  })

  it('forwards className so callers control sizing', () => {
    const { container } = render(<Logo className="size-7" />)

    expect(container.querySelector('svg')).toHaveClass('size-7')
  })
})
