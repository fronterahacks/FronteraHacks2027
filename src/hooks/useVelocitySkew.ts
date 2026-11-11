import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import type { RefObject } from 'react'
import { scrollState } from '../scroll/scrollState'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

gsap.registerPlugin(useGSAP)

/** Degrees of skew per unit of Lenis velocity, and the most it can lean. */
const SKEW_PER_VELOCITY = 0.12
const MAX_SKEW = 5

/**
 * Leans an element in the direction you're scrolling, proportional to how
 * fast (Lenis velocity), and springs it back upright when you stop. Makes
 * the page feel physical. Reduced motion: no skew.
 */
export function useVelocitySkew(ref: RefObject<HTMLElement | null>) {
  const reduceMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduceMotion) return

      // quickTo = a reusable tween we just keep re-aiming; it eases toward
      // the latest target instead of snapping.
      const skewTo = gsap.quickTo(el, 'skewY', { duration: 0.6, ease: 'power3.out' })

      const update = () => {
        const target = gsap.utils.clamp(-MAX_SKEW, MAX_SKEW, -scrollState.velocity * SKEW_PER_VELOCITY)
        skewTo(target)
      }
      gsap.ticker.add(update)
      return () => gsap.ticker.remove(update)
    },
    { dependencies: [reduceMotion] },
  )
}
