import { lazy, Suspense, type ComponentType } from 'react'
import { Countdown } from './components/Countdown'
import { CustomCursor } from './components/CustomCursor'
import { GrainOverlay } from './components/GrainOverlay'
import { Nav } from './components/Nav'
import { SectionHeading } from './components/SectionHeading'
import { navLinks, sectionTitles, type NavLink } from './data/event'
import { About } from './sections/About'
import { Faq } from './sections/Faq'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Schedule } from './sections/Schedule'
import { Sponsors } from './sections/Sponsors'
import { Tracks } from './sections/Tracks'
import { useLenis } from './scroll/useLenis'

// Lazy-load the 3D scene so page content isn't blocked by Three.js.
const Scene = lazy(() => import('./three/Scene'))

/** Finished sections, by nav link. Links without one show a placeholder. */
const sectionComponents: Partial<Record<NavLink['href'], ComponentType<{ index: number }>>> = {
  '#about': About,
  '#tracks': Tracks,
  '#schedule': Schedule,
  '#sponsors': Sponsors,
  '#faq': Faq,
}

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
        {/* One section per nav link. Finished sections render their own
            component; the rest are placeholders with just their heading. */}
        {navLinks.map((link, i) => {
          const Section = sectionComponents[link.href]
          return Section ? (
            <Section key={link.href} index={i + 1} />
          ) : (
            <section
              key={link.href}
              id={link.href.slice(1)}
              className="min-h-[80svh] scroll-mt-20 px-5 py-28 sm:px-8 md:px-12 md:py-36"
            >
              <SectionHeading index={i + 1} label={link.label} title={sectionTitles[link.href]} />
            </section>
          )
        })}
      </main>

      <Footer />

      <GrainOverlay />
      <CustomCursor />
    </>
  )
}

export default App
