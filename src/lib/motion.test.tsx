import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { AnimatedWords } from './motion'

describe('AnimatedWords', () => {
  it('renders one span per word', () => {
    const { container } = render(
      <h1>
        <AnimatedWords text="Grow your revenue" shouldReduceMotion={false} />
      </h1>,
    )
    const words = [...container.querySelectorAll('span')].map((s) => s.textContent)

    expect(words).toEqual(['Grow', 'your', 'revenue'])
  })

  it('ignores extra whitespace — no phantom words in the stagger', () => {
    const { container } = render(
      <h1>
        <AnimatedWords text="  Grow   revenue " shouldReduceMotion={false} />
      </h1>,
    )
    const words = [...container.querySelectorAll('span')].map((s) => s.textContent)

    expect(words).toEqual(['Grow', 'revenue'])
  })
})
