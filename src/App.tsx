import { lazy, Suspense } from 'react'
import { Countdown } from './components/Countdown'
import { Nav } from './components/Nav'
import { SectionHeading } from './components/SectionHeading'
import { navLinks, sectionTitles } from './data/event'
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
        {/* The countdown shares the hero's glass panel, under the date/location row */}
        <Hero>
          <Countdown />
        </Hero>
        {/* Temporary placeholder sections, one per nav link, each opened with
            its real heading. The content is added section by section. */}
        {navLinks.map((link, i) => (
          <section
            key={link.href}
            id={link.href.slice(1)}
            className="min-h-[80svh] scroll-mt-20 px-5 py-28 sm:px-8 md:px-12 md:py-36"
          >
            <SectionHeading index={i + 1} label={link.label} title={sectionTitles[link.href]} />
          </section>
        ))}
      </main>
    </>
  )
}

export default App
