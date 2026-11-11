import { lazy, Suspense } from 'react'
import { useLenis } from './scroll/useLenis'

// Lazy-load the 3D scene so page content isn't blocked by Three.js.
const Scene = lazy(() => import('./three/Scene'))

function App() {
  useLenis()

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-neutral-950" aria-hidden="true">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>

      <main className="text-white">
        <section className="flex min-h-svh flex-col items-center justify-center gap-4">
          <h1 className="text-5xl font-bold tracking-tight">FronteraHacks 2027</h1>
          <p className="text-neutral-400">Coming soon. Scroll down.</p>
        </section>
        {/* Temporary tall sections so there is something to scroll through. */}
        <section className="flex min-h-svh items-center justify-center text-3xl text-neutral-500">
          Section 2
        </section>
        <section className="flex min-h-svh items-center justify-center text-3xl text-neutral-500">
          Section 3
        </section>
      </main>
    </>
  )
}

export default App
