/**
 * Full-screen film grain + very faint scanlines over the whole site.
 * Takes the flat "digital" edge off the dark backgrounds and nods to the
 * old site's CRT look. Purely visual: fixed, above everything, never
 * catches clicks, hidden from screen readers. The grain shifts a few times
 * a second (animate-grain, motion-safe only) so it reads as film, not dirt.
 */
export function GrainOverlay() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {/* Grain: SVG fractal noise tile, oversized so the jitter never shows an edge */}
      <div className="absolute -inset-[50%] bg-[url('/grain.svg')] bg-[length:180px_180px] opacity-[0.07] mix-blend-overlay motion-safe:animate-grain" />
      {/* Scanlines: 1px dark lines every 3px, barely visible */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgb(0_0_0/0.18)_0px,rgb(0_0_0/0.18)_1px,transparent_1px,transparent_3px)] opacity-40" />
    </div>
  )
}
