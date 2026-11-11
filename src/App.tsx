import { useLenis } from './scroll/useLenis'

function App() {
  useLenis()

  return (
    <main className="bg-neutral-950 text-white">
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
  )
}

export default App
