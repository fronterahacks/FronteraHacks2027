import { useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useEffect } from 'react'

/**
 * Renders 3D frames from GSAP's ticker instead of R3F's own loop.
 *
 * Lenis updates the page's scroll position on GSAP's ticker. If the 3D
 * canvas drew on a separate requestAnimationFrame loop, the two could run
 * in either order each frame, so 3D could read the scroll one frame late and
 * jitter against the HTML while scrolling fast. Lenis's ticker callback is
 * registered first (App mounts before this lazy scene), so on every tick the
 * page scrolls first and the 3D draws second, always in sync.
 *
 * Requires <Canvas frameloop="never">.
 */
export function GsapFrameDriver() {
  const advance = useThree((s) => s.advance)

  useEffect(() => {
    const tick = (time: number) => advance(time * 1000) // seconds -> ms
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [advance])

  return null
}
