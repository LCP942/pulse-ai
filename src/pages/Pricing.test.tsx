import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useSearchParams } from 'react-router'
import Pricing from './Pricing'

/** Echoes the query params so tests can assert what Pricing forwarded. */
function CheckoutProbe() {
  const [searchParams] = useSearchParams()
  return (
    <div>
      Checkout page — tier:{searchParams.get('tier')} billing:{searchParams.get('billing')}
    </div>
  )
}

function renderPricing() {
  return render(
    <MemoryRouter initialEntries={['/pricing']}>
      <Routes>
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/checkout" element={<CheckoutProbe />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Pricing', () => {
  it('renders a page heading', () => {
    renderPricing()
    expect(screen.getByRole('heading', { level: 1, name: /pricing/i })).toBeInTheDocument()
  })

  it('renders a full feature comparison table across all tiers, with a CTA per column', () => {
    renderPricing()
    const table = screen.getByRole('table', { name: /compare plans/i })
    expect(table).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /basic/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /pro/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /enterprise/i })).toBeInTheDocument()
    expect(within(table).getByRole('button', { name: /choose basic/i })).toBeInTheDocument()
    expect(within(table).getByRole('button', { name: /choose pro/i })).toBeInTheDocument()
    expect(within(table).getByRole('button', { name: /choose enterprise/i })).toBeInTheDocument()
  })

  it('marks the Pro column as the most popular choice', () => {
    renderPricing()
    expect(screen.getAllByText(/most popular/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders stacked tier cards for narrow screens while hiding the table there', () => {
    renderPricing()

    // Narrow screens get one self-contained card per tier (name, price,
    // features, CTA) instead of the 4-column comparison table, which is
    // hidden below md and shown from md up.
    const cards = screen.getByTestId('mobile-tiers')
    expect(cards).toHaveClass('md:hidden')

    const table = screen.getByRole('table', { name: /compare plans/i })
    expect(table.parentElement?.parentElement).toHaveClass('hidden', 'md:block')

    for (const name of ['Basic', 'Pro', 'Enterprise']) {
      expect(within(cards).getByText(name)).toBeInTheDocument()
    }
    expect(within(cards).getAllByRole('button', { name: /choose/i })).toHaveLength(3)
    expect(within(cards).getByText(/most popular/i)).toBeInTheDocument()
    // Per-tier feature lists come from the pricing data, not the table rows.
    expect(within(cards).getByText('Up to $10k MRR tracked')).toBeInTheDocument()
    expect(within(cards).getByText('Churn prediction')).toBeInTheDocument()
    expect(within(cards).getByText('$199')).toBeInTheDocument()
  })

  it('updates the stacked tier cards when toggling annual billing', async () => {
    const user = userEvent.setup()
    renderPricing()
    const cards = screen.getByTestId('mobile-tiers')

    await user.click(screen.getByRole('button', { name: /annual/i }))

    expect(within(cards).getByText('$159')).toBeInTheDocument()
    expect(within(cards).getByText(/billed annually at \$1,908\/yr/i)).toBeInTheDocument()
  })

  it('keeps the Most Popular overlay aligned when the comparison table is scrolled', () => {
    renderPricing()

    // On narrow screens the table scrolls horizontally inside its wrapper
    // while the overlay ring is absolutely positioned outside it — the
    // overlay must shift left by the scrolled amount to stay glued to the
    // Pro column.
    const table = screen.getByRole('table', { name: /compare plans/i })
    const scroller = table.parentElement as HTMLElement
    const overlay = within(scroller.parentElement as HTMLElement).getByText(/most popular/i)
      .parentElement as HTMLElement

    // Because the overlay sits outside the scroller, the shared wrapper must
    // clip horizontal overflow — otherwise the ring itself widens the page
    // on narrow screens.
    expect(scroller.parentElement).toHaveClass('overflow-x-clip')

    const initialLeft = Number.parseFloat(overlay.style.left || '0')

    Object.defineProperty(scroller, 'scrollLeft', { value: 120, configurable: true })
    fireEvent.scroll(scroller)

    expect(Number.parseFloat(overlay.style.left || '0')).toBe(initialLeft - 120)
  })

  it('navigates to /checkout with the chosen tier and billing period', async () => {
    const user = userEvent.setup()
    renderPricing()

    await user.click(screen.getAllByRole('button', { name: /choose pro/i })[0])

    expect(await screen.findByText(/tier:pro billing:monthly/)).toBeInTheDocument()
  })

  it('forwards the annual billing choice to checkout — the shown price must be the paid price', async () => {
    const user = userEvent.setup()
    renderPricing()

    await user.click(screen.getByRole('button', { name: /annual/i }))
    await user.click(screen.getAllByRole('button', { name: /choose pro/i })[0])

    expect(await screen.findByText(/tier:pro billing:annual/)).toBeInTheDocument()
  })

  it('defaults to monthly pricing and offers an annual toggle that saves money', async () => {
    const user = userEvent.setup()
    renderPricing()

    expect(screen.getAllByText('$199').length).toBeGreaterThanOrEqual(1)

    await user.click(screen.getByRole('button', { name: /annual/i }))
    expect(screen.getAllByText('$159').length).toBeGreaterThanOrEqual(1)
  })

  it('advertises a free trial and a money-back guarantee to reduce signup friction', () => {
    renderPricing()
    expect(screen.getAllByText(/free trial/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/money-back guarantee/i).length).toBeGreaterThan(0)
  })

  it('answers common pre-purchase questions in a plain, non-collapsible FAQ section', () => {
    renderPricing()
    expect(
      screen.getByRole('heading', { level: 2, name: /frequently asked questions/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/is there a free trial/i)).toBeVisible()
    expect(screen.getByText(/every plan includes a 14-day free trial/i)).toBeVisible()
    expect(document.querySelector('details')).not.toBeInTheDocument()
  })
})
