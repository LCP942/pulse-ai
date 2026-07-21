import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import Checkout from './Checkout'

const mockSubmit = vi.fn()

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PaymentElement: () => <div data-testid="payment-element">Stripe card form</div>,
  useStripe: () => ({}),
  useElements: () => ({ submit: mockSubmit }),
}))

vi.mock('@/lib/stripe', () => ({
  getStripePromise: () => Promise.resolve(null),
}))

function renderCheckout(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      {/* Stands in for the app Nav: a way to leave checkout mid-processing. */}
      <Link to="/pricing">Leave checkout</Link>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pricing" element={<div>Pricing page</div>} />
        <Route path="/confirmation" element={<div>Confirmation page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Checkout', () => {
  beforeEach(() => {
    mockSubmit.mockReset()
  })

  it('redirects to /pricing when the tier param is missing or invalid', () => {
    renderCheckout('/checkout?tier=unknown')
    expect(screen.getByText('Pricing page')).toBeInTheDocument()

    cleanup()
    renderCheckout('/checkout')
    expect(screen.getByText('Pricing page')).toBeInTheDocument()
  })

  it('charges and displays the annual total when billing=annual', () => {
    renderCheckout('/checkout?tier=pro&billing=annual')

    expect(screen.getByText('$1,908')).toBeInTheDocument()
    expect(screen.getByText(/\$159\/mo billed annually/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /pay \$1,908 — pro/i }),
    ).toBeInTheDocument()
  })

  it('falls back to monthly for an unknown billing param', () => {
    renderCheckout('/checkout?tier=pro&billing=weekly')

    expect(screen.getByRole('button', { name: /pay \$199 — pro/i })).toBeInTheDocument()
  })

  it('renders the selected tier summary and the Stripe payment form', () => {
    renderCheckout('/checkout?tier=pro')

    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('$199')).toBeInTheDocument()
    expect(screen.getByTestId('payment-element')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /pay \$199 — pro/i }),
    ).toBeInTheDocument()
  })

  it('shows a validation error and does not navigate when Stripe validation fails', async () => {
    const user = userEvent.setup()
    mockSubmit.mockResolvedValue({ error: { message: 'Your card number is incomplete.' } })
    renderCheckout('/checkout?tier=pro')

    await user.click(screen.getByRole('button', { name: /pay \$199 — pro/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your card number is incomplete.',
    )
    expect(screen.queryByText('Confirmation page')).not.toBeInTheDocument()
  })

  it('shows a loading state then navigates to confirmation on successful validation', async () => {
    const user = userEvent.setup()
    mockSubmit.mockResolvedValue({ error: undefined })
    renderCheckout('/checkout?tier=pro')

    await user.click(screen.getByRole('button', { name: /pay \$199 — pro/i }))

    expect(screen.getByRole('button', { name: /processing/i })).toHaveAttribute(
      'aria-busy',
      'true',
    )

    await waitFor(() => expect(screen.getByText('Confirmation page')).toBeInTheDocument(), {
      timeout: 2000,
    })
    expect(mockSubmit).toHaveBeenCalledTimes(1)
  })

  it('does not hijack navigation when the user leaves during processing', async () => {
    const user = userEvent.setup()
    mockSubmit.mockResolvedValue({ error: undefined })
    renderCheckout('/checkout?tier=pro')

    await user.click(screen.getByRole('button', { name: /pay \$199 — pro/i }))
    // Walk away while the simulated 1.2s processing runs.
    await user.click(screen.getByRole('link', { name: /leave checkout/i }))
    expect(screen.getByText('Pricing page')).toBeInTheDocument()

    // The stale timer must not yank the visitor to /confirmation.
    await new Promise((resolve) => setTimeout(resolve, 1500))
    expect(screen.queryByText('Confirmation page')).not.toBeInTheDocument()
    expect(screen.getByText('Pricing page')).toBeInTheDocument()
  })
})
