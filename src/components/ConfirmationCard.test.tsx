import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConfirmationCard } from './ConfirmationCard'

describe('ConfirmationCard', () => {
  it('renders the selected tier name and price with a success message', () => {
    render(<ConfirmationCard name="Pro" price={199} />)

    expect(screen.getByText(/you're all set/i)).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('$199')).toBeInTheDocument()
  })

  it('formats non-integer prices as currency, not raw interpolation', () => {
    render(<ConfirmationCard name="Basic" price={79.5} />)

    expect(screen.getByText('$79.50')).toBeInTheDocument()
  })
})
