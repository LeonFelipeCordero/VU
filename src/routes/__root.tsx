import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Vigiles Urbani | Community reports' },
      { name: 'description', content: 'Find and submit location-based community reports.' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }, { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => <main className="about"><h1>Page not found</h1><Link to="/">Return to the map</Link></main>,
  errorComponent: ({ reset }) => (
    <main className="about"><h1>Something went wrong</h1><p>The page could not load. Your report has not been submitted.</p><button onClick={reset}>Try again</button></main>
  ),
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <header className="site-header">
          <Link to="/" className="wordmark">Vigiles Urbani</Link>
          <nav aria-label="Main navigation"><Link to="/" activeOptions={{ exact: true }}>Map</Link><Link to="/about">About</Link></nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
