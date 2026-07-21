import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HeroVideo } from './HeroVideo'

const motionPreference = vi.hoisted(() => ({ reduced: false }))

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => motionPreference.reduced,
}))

const video = () => screen.getByTestId('hero-video') as HTMLVideoElement

/** jsdom has no layout, so drive the portrait query the component asks for. */
const setViewport = (portrait: boolean) => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: portrait,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  }))
}

describe('HeroVideo', () => {
  beforeEach(() => {
    motionPreference.reduced = false
    setViewport(false)
    // jsdom's play() is not implemented; resolve by default so mounting the
    // intro never logs, and individual tests can reject to simulate a block.
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  })

  it('opens on the intro, played once', () => {
    render(<HeroVideo />)

    expect(video()).toHaveAttribute('src', '/hero-intro.mp4')
    expect(video().loop).toBe(false)
    expect(video().autoplay).toBe(true)
  })

  it('hands off to the seamless loop once the intro ends', () => {
    render(<HeroVideo />)
    fireEvent.ended(video())

    expect(video()).toHaveAttribute('src', '/hero-loop.mp4')
    expect(video().loop).toBe(true)
  })

  it('falls back to the loop when the intro fails to load', () => {
    render(<HeroVideo />)
    fireEvent.error(video())

    expect(video()).toHaveAttribute('src', '/hero-loop.mp4')
    expect(video().loop).toBe(true)
  })

  it('falls back to the loop when autoplay is blocked', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(
      new DOMException('denied', 'NotAllowedError'),
    )
    render(<HeroVideo />)

    await waitFor(() => expect(video()).toHaveAttribute('src', '/hero-loop.mp4'))
  })

  it('preloads the loop clip while the intro plays, for a seamless handoff', () => {
    render(<HeroVideo />)

    expect(
      document.head.querySelector('link[rel="preload"][href="/hero-loop.mp4"]'),
    ).toBeInTheDocument()
  })

  it('skips the intro and never autoplays under reduced motion', () => {
    motionPreference.reduced = true
    render(<HeroVideo />)

    expect(video()).toHaveAttribute('src', '/hero-loop.mp4')
    expect(video().autoplay).toBe(false)
  })

  it('stays decorative — the hero copy carries the meaning', () => {
    render(<HeroVideo />)

    expect(video()).toHaveAttribute('aria-hidden', 'true')
  })

  it('is inert, so it never swallows clicks nor offers native video controls', () => {
    render(<HeroVideo className="absolute inset-0" />)

    // Without this the browser treats the background as a <video> the user can
    // right-click: loop, pause, PiP, "save video as"…
    expect(video()).toHaveClass('pointer-events-none')
    expect(video()).toHaveClass('absolute', 'inset-0')
  })

  describe('on a portrait viewport', () => {
    // object-cover crops the landscape cut to ~37% of its width on a phone,
    // which slices the coin in half — hence a separately framed render.
    beforeEach(() => setViewport(true))

    it('uses the portrait framing for both clips', () => {
      render(<HeroVideo />)
      expect(video()).toHaveAttribute('src', '/hero-intro-portrait.mp4')

      fireEvent.ended(video())
      expect(video()).toHaveAttribute('src', '/hero-loop-portrait.mp4')
    })

    it('still honours reduced motion', () => {
      motionPreference.reduced = true
      render(<HeroVideo />)

      expect(video()).toHaveAttribute('src', '/hero-loop-portrait.mp4')
      expect(video().autoplay).toBe(false)
    })
  })
})
