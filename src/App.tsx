import { lazy, Suspense } from 'react'
import { Nav } from './components/Nav'
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
        <section className="flex min-h-svh flex-col items-center justify-center gap-4">
          <h1 className="text-5xl font-bold tracking-tight text-fh-purple text-fh-glow">
            Frontera Hacks 2027
          </h1>
          <p className="text-2xl font-bold">
            Spark your curiosity at <span className="text-fh-gradient">Frontera Hacks</span>
          </p>
          <p className="font-mono text-fh-lilac">&gt; Coming soon. Scroll down.</p>
        </section>
        {/* Temporary tall sections so there is something to scroll through. */}
        <section className="flex min-h-svh items-center justify-center text-3xl text-fh-lilac/60">
          Section 2
        </section>
        <section className="flex min-h-svh items-center justify-center text-3xl text-fh-lilac/60">
          Section 3
        </section>
      </main>
    </>
  )
}

export default App
