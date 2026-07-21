import { describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import Confirmation from './Confirmation'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/pricing" element={<div>Pricing page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Confirmation', () => {
  it('redirects to /pricing when the tier param is missing or invalid', () => {
    renderAt('/confirmation?tier=unknown')
    expect(screen.getByText('Pricing page')).toBeInTheDocument()

    cleanup()
    renderAt('/confirmation')
    expect(screen.getByText('Pricing page')).toBeInTheDocument()
  })

  it("renders the selected tier's confirmation details", () => {
    renderAt('/confirmation?tier=pro')

    expect(screen.getByText(/you're all set/i)).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('$199')).toBeInTheDocument()
  })

  it('confirms the annual total when billing=annual', () => {
    renderAt('/confirmation?tier=pro&billing=annual')

    expect(screen.getByText('$1,908')).toBeInTheDocument()
    expect(screen.getByText(/\$159\/mo billed annually/i)).toBeInTheDocument()
  })
})
