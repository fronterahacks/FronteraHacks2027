/**
 * Shared, mutable scroll values written by Lenis and read by the 3D scene
 * every frame. This is a plain object on purpose: scroll fires 60-120 times
 * per second, and storing it in React state would re-render on every frame.
 */
export const scrollState = {
  /** How fast the page is scrolling. Negative = scrolling up. */
  velocity: 0,
  /** Where we are on the page, from 0 (top) to 1 (bottom). */
  progress: 0,
}
