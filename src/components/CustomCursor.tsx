import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/** Anything clickable (or marked data-cursor) makes the ring swell. */
const INTERACTIVE = 'a, button, [role="button"], [data-cursor]'

/**
 * Custom cursor: a small dot that tracks the mouse exactly, and a ring that
 * trails smoothly behind it. Over anything clickable the ring swells into a
 * soft pink/purple halo and the dot hides; pressing squeezes the ring.
 *
 * Only for precise pointers (mouse / trackpad) with motion allowed; touch
 * screens and reduced-motion users keep the normal cursor. The native cursor
 * is hidden only while this one is active (html.has-custom-cursor).
 */
export function CustomCursor() {
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reduceMotion = usePrefersReducedMotion()
  const enabled = finePointer && !reduceMotion

  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const d = dot.current
    const r = ring.current
    if (!enabled || !d || !r) return
    document.documentElement.classList.add('has-custom-cursor')

    // quickTo = reusable tweens we keep re-aiming. Dot: instant; ring: lags.
    const dotX = gsap.quickTo(d, 'x', { duration: 0.05 })
    const dotY = gsap.quickTo(d, 'y', { duration: 0.05 })
    const ringX = gsap.quickTo(r, 'x', { duration: 0.45, ease: 'power3.out' })
    const ringY = gsap.quickTo(r, 'y', { duration: 0.45, ease: 'power3.out' })
    let visible = false

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
      if (!visible) {
        visible = true
        gsap.to([d, r], { autoAlpha: 1, duration: 0.3 })
      }
    }
    const onLeave = () => {
      visible = false
      gsap.to([d, r], { autoAlpha: 0, duration: 0.3 })
    }
    const onOver = (e: PointerEvent) => {
      const hot = (e.target as Element | null)?.closest?.(INTERACTIVE)
      r.dataset.hot = String(Boolean(hot))
      d.dataset.hot = String(Boolean(hot))
    }
    const onDown = () => gsap.to(r, { scale: 0.8, duration: 0.15 })
    const onUp = () => gsap.to(r, { scale: 1, duration: 0.3, ease: 'back.out(3)' })

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70]">
      {/* Ring: trails behind; swells into a halo over clickable things */}
      <div
        ref={ring}
        data-hot="false"
        className="invisible absolute top-0 left-0 -mt-5 -ml-5 size-10 rounded-full border border-white/50 opacity-0 transition-[width,height,margin,background-color,border-color] duration-300 ease-out data-[hot=true]:-mt-9 data-[hot=true]:-ml-9 data-[hot=true]:size-18 data-[hot=true]:border-fh-pink/70 data-[hot=true]:bg-fh-purple/15"
      />
      {/* Dot: exact position; inverts what's under it so it's always visible */}
      <div
        ref={dot}
        data-hot="false"
        className="invisible absolute top-0 left-0 -mt-1 -ml-1 size-2 rounded-full bg-white opacity-0 mix-blend-difference transition-transform duration-200 data-[hot=true]:scale-0"
      />
    </div>
  )
}
