import type { PointerEvent } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/** Most the element tilts at its edges, in degrees. */
const MAX_TILT = 8

/**
 * Hover tilt + glare for a card. Returns pointer handlers to spread onto
 * the element. They write CSS variables straight onto it (no React
 * re-renders while moving):
 *   --rx / --ry  rotation toward the cursor (use in a transform)
 *   --gx / --gy  cursor position in %, for a glare gradient
 *   --glare      0 or 1, glare visibility
 * Tilt is mouse-only and skipped with reduced motion; the glare still shows.
 */
export function useTilt() {
  const reduceMotion = usePrefersReducedMotion()

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width // 0..1
    const py = (e.clientY - r.top) / r.height
    if (!reduceMotion) {
      el.style.setProperty('--rx', `${(0.5 - py) * MAX_TILT * 2}deg`)
      el.style.setProperty('--ry', `${(px - 0.5) * MAX_TILT * 2}deg`)
    }
    el.style.setProperty('--gx', `${px * 100}%`)
    el.style.setProperty('--gy', `${py * 100}%`)
    el.style.setProperty('--glare', '1')
  }

  const onPointerLeave = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--glare', '0')
  }

  return { onPointerMove, onPointerLeave }
}
