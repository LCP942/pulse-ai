import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
})

// jsdom does not implement matchMedia, which HeroVideo uses to pick its
// framing. Defaults to "no match" — landscape, full motion; tests that need a
// specific viewport stub it themselves.
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
}))

// jsdom does not implement IntersectionObserver, used by motion's `whileInView`.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: ReadonlyArray<number> = []
  readonly scrollMargin = ''
  disconnect() {}
  observe() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
  unobserve() {}
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

// jsdom does not implement ResizeObserver, used by react-three-fiber's <Canvas>.
class MockResizeObserver implements ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

vi.stubGlobal('ResizeObserver', MockResizeObserver)

// jsdom does not implement scrollTo, used by Layout to reset scroll on
// navigation.
vi.stubGlobal('scrollTo', () => {})
