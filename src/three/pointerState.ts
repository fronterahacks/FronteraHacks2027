import { useEffect } from 'react'

/**
 * Pointer position shared with the 3D scene, like scrollState.
 * The canvas sits behind the page content, so it never receives mouse
 * events itself; we listen on the window instead.
 *
 * x/y are normalised: -1 (left/bottom) .. 1 (right/top), centre = 0.
 */
export const pointerState = {
  x: 0,
  y: 0,
  /** False until the pointer first moves, and after it leaves the window. */
  active: false,
}

/** Starts tracking the pointer. Call once (in Scene). */
export function usePointerTracking() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerState.x = (e.clientX / window.innerWidth) * 2 - 1
      pointerState.y = -((e.clientY / window.innerHeight) * 2 - 1)
      pointerState.active = true
    }
    const onLeave = () => {
      pointerState.active = false
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    // Taps on touch screens don't fire pointermove; count them too.
    window.addEventListener('pointerdown', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])
}
