import { lazy, Suspense } from 'react'
import { Countdown } from './components/Countdown'
import { Nav } from './components/Nav'
import { navLinks } from './data/event'
import { Hero } from './sections/Hero'
import { useLenis } from './scroll/useLenis'

// Lazy-load the 3D scene so page content isn't blocked by Three.js.
const Scene = lazy(() => import('./three/Scene'))

function App() {
  useLenis()

  return (
    <>
      {/* Gradient shows instantly; the 3D scene fades in on top once loaded. */}
      <div
        className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_45%,rgb(99_51_255/0.25)_0%,var(--color-fh-bg)_65%)]"
        aria-hidden="true"
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>

      <Nav />

      <main>
        <Hero />

        {/* Countdown gets its own full-width band, aligned with the hero edges */}
        <section aria-label="Countdown" className="px-5 py-24 sm:px-8 md:px-12 md:py-32">
          <Countdown />
        </section>
        {/* Temporary placeholder sections, one per nav link, so the links have
            somewhere to go. Each gets replaced by its real component later. */}
        {navLinks.map((link) => (
          <section
            key={link.href}
            id={link.href.slice(1)}
            className="flex min-h-svh scroll-mt-20 items-center justify-center font-mono text-3xl text-fh-lilac/60"
          >
            {`// ${link.label.toUpperCase()}.exe`}
          </section>
        ))}
      </main>
    </>
  )
}

export default App
