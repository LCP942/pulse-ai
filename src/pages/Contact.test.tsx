import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Contact from './Contact'

describe('Contact', () => {
  it('renders a heading and the contact form fields', () => {
    render(<Contact />)

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('shows inline validation errors when required fields are left empty on blur', async () => {
    const user = userEvent.setup()
    render(<Contact />)

    await user.click(screen.getByLabelText(/name/i))
    await user.tab()

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
  })

  it('ties each error message to its field for assistive tech', async () => {
    const user = userEvent.setup()
    render(<Contact />)

    await user.click(screen.getByRole('button', { name: /send message/i }))

    const name = screen.getByLabelText(/name/i)
    const error = screen.getByText(/name is required/i)
    expect(error).toHaveAttribute('id')
    expect(name).toHaveAttribute('aria-describedby', error.getAttribute('id'))
    expect(name).toHaveAttribute('aria-invalid', 'true')
  })

  it('moves focus to the success confirmation so it is announced', async () => {
    const user = userEvent.setup()
    render(<Contact />)

    await user.type(screen.getByLabelText(/name/i), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Interested in the Growth plan.')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    const heading = await screen.findByRole('heading', { name: /message sent/i })
    expect(heading).toHaveFocus()
  })

  it('shows a success confirmation after submitting a valid form', async () => {
    const user = userEvent.setup()
    render(<Contact />)

    await user.type(screen.getByLabelText(/name/i), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Interested in the Growth plan.')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText(/message sent/i)).toBeInTheDocument()
  })
})
