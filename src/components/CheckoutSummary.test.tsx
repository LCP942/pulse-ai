import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CheckoutSummary } from './CheckoutSummary'

describe('CheckoutSummary', () => {
  it("renders the selected tier's name and price", () => {
    render(<CheckoutSummary name="Pro" price={199} />)

    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('$199')).toBeInTheDocument()
  })

  it('formats non-integer prices as currency, not raw interpolation', () => {
    render(<CheckoutSummary name="Basic" price={79.5} />)

    expect(screen.getByText('$79.50')).toBeInTheDocument()
  })
})
