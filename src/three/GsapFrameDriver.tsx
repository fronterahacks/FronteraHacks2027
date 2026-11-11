import { useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useEffect } from 'react'

/** After the last 3D region leaves the screen, draw this many more frames so
 *  each piece can hide itself (canvas ends up blank), then stop drawing. */
const TRAILING_FRAMES = 4

/**
 * Is any part of the page that has 3D on (or near) the screen?
 * Cheap DOM position checks, matching each piece's own visibility rules:
 * - hero mascot: until the hero's bottom edge scrolls off the top (where
 *   the scattered mascot has fully faded)
 * - schedule neon timeline: same window NeonTimeline uses
 * - footer finale: once its stage starts entering the screen
 */
function anything3DOnScreen() {
  const H = window.innerHeight
  const hero = document.getElementById('top')?.getBoundingClientRect()
  if (hero && hero.bottom > -H * 0.05) return true
  const schedule = document.getElementById('schedule')?.getBoundingClientRect()
  if (schedule && schedule.top < H * 1.2 && schedule.bottom > -H * 0.6) return true
  const finale = document.querySelector('[data-finale-stage]')?.getBoundingClientRect()
  if (finale && finale.top < H * 1.02) return true
  return false
}

/**
 * Renders 3D frames from GSAP's ticker instead of R3F's own loop, and pauses
 * rendering entirely while no 3D is on screen (saves battery and keeps
 * scrolling smooth on slower phones in the 3D-free sections).
 *
 * Why GSAP's ticker: Lenis updates the page's scroll position on it. If the
 * 3D canvas drew on a separate requestAnimationFrame loop, the two could run
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
    let trailing = TRAILING_FRAMES

    // gsap.ticker gives seconds. With frameloop="never", R3F uses this value
    // directly as clock.elapsedTime (seconds), and delta = new - old. Do NOT
    // convert to ms: that ran every useFrame clock 1000x too fast.
    const tick = (time: number) => {
      if (anything3DOnScreen()) {
        trailing = TRAILING_FRAMES
      } else if (trailing > 0) {
        trailing--
      } else {
        return // nothing 3D in view: skip rendering this frame
      }
      advance(time)
    }

    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [advance])

  return null
}
