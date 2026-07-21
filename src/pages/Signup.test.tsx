import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Signup from './Signup'

describe('Signup', () => {
  it('renders a heading and the signup form fields', () => {
    render(<Signup />)

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('shows inline validation errors instead of native browser bubbles', async () => {
    const user = userEvent.setup()
    render(<Signup />)

    expect(document.querySelector('form')).toHaveAttribute('novalidate')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
  })

  it('confirms the simulated signup and moves focus to the confirmation', async () => {
    const user = userEvent.setup()
    render(<Signup />)

    await user.type(screen.getByLabelText(/name/i), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/password/i), 'correct-horse')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    const heading = await screen.findByRole('heading', { name: /you're in/i })
    expect(heading).toHaveFocus()
    expect(screen.queryByRole('button', { name: /sign up/i })).not.toBeInTheDocument()
  })
})
