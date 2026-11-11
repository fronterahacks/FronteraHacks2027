import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type Options = {
  /** Shortest / longest wait between flickers, in ms. */
  minDelay?: number
  maxDelay?: number
  /** How long one flicker lasts (match the CSS animation), in ms. */
  duration?: number
  /** Chance (0..1) that a flicker hits every item at once. */
  allChance?: number
}

/**
 * Picks something to flicker at random moments, like a failing neon sign.
 * Returns the index (0..count-1) currently flickering, 'all', or null.
 * Reduced motion: never flickers.
 */
export function useRandomFlicker(
  count: number,
  { minDelay = 2500, maxDelay = 8000, duration = 700, allChance = 0.2 }: Options = {},
) {
  const reduceMotion = usePrefersReducedMotion()
  const [active, setActive] = useState<number | 'all' | null>(null)

  useEffect(() => {
    if (reduceMotion) return
    let timer: number

    const scheduleNext = () => {
      const wait = minDelay + Math.random() * (maxDelay - minDelay)
      timer = window.setTimeout(() => {
        setActive(Math.random() < allChance ? 'all' : Math.floor(Math.random() * count))
        timer = window.setTimeout(() => {
          setActive(null)
          scheduleNext()
        }, duration)
      }, wait)
    }

    scheduleNext()
    return () => window.clearTimeout(timer)
  }, [reduceMotion, count, minDelay, maxDelay, duration, allChance])

  return reduceMotion ? null : active
}
