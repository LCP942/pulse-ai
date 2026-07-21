import type { ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import { Layout } from './Layout'
import Landing from './pages/Landing'
import NotFound from './pages/NotFound'

/** Route-level code splitting: the page's chunk loads on first navigation,
    and the router waits for it before rendering — no Suspense flash. */
const lazyPage = (load: () => Promise<{ default: ComponentType }>) => {
  return async () => ({ Component: (await load()).default })
}

// Landing and NotFound stay eager: Landing is the entry page (lazy-loading it
// would only trade the single bundle for a blank first paint) and NotFound is
// tiny and shared with the error path, which must not itself be able to fail.
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    // Without this, a runtime error in any page drops the visitor onto React
    // Router's unbranded developer error screen with no Nav and no way back.
    errorElement: (
      <Layout>
        <NotFound />
      </Layout>
    ),
    // Rendered while an initial lazy match is still loading (direct deep
    // link): background only, the page fades in on arrival anyway.
    HydrateFallback: () => null,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/about', lazy: lazyPage(() => import('./pages/About')) },
      { path: '/features', lazy: lazyPage(() => import('./pages/Features')) },
      { path: '/pricing', lazy: lazyPage(() => import('./pages/Pricing')) },
      { path: '/checkout', lazy: lazyPage(() => import('./pages/Checkout')) },
      { path: '/confirmation', lazy: lazyPage(() => import('./pages/Confirmation')) },
      { path: '/contact', lazy: lazyPage(() => import('./pages/Contact')) },
      { path: '/signup', lazy: lazyPage(() => import('./pages/Signup')) },
      { path: '*', element: <NotFound /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
