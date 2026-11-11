import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useEffect } from 'react'
import { scrollState } from './scrollState'

gsap.registerPlugin(ScrollTrigger)

/**
 * Starts Lenis smooth scrolling, drives it from GSAP's ticker so Lenis and
 * ScrollTrigger share one clock, and copies velocity/progress into scrollState.
 * Call once, near the root of the app.
 */
export function useLenis() {
  useEffect(() => {
    // Respect users who ask for less motion: keep native scrolling.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const lenis = new Lenis({
      lerp: 0.1,
      // Smooth-scroll in-page links (#about, #faq, ...). The negative offset
      // stops each section just below the fixed nav bar instead of under it.
      anchors: { offset: -80 },
    })

    lenis.on('scroll', (instance) => {
      scrollState.velocity = instance.velocity
      scrollState.progress = instance.progress
      ScrollTrigger.update()
    })

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])
}
