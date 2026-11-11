import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type RevealProps = {
  children: ReactNode
  className?: string
  /**
   * Animate each direct child one after another (e.g. a row of cards)
   * instead of the whole block at once. Value = seconds between children.
   */
  stagger?: number
  /** Seconds to wait after it enters view. */
  delay?: number
}

/**
 * Fades and lifts a block (cards, images, buttons, paragraphs) into place
 * when it scrolls into view. Plays once. Reduced motion: no animation.
 *
 * Use <RevealText> for headings (line-by-line masks); use this for
 * everything else.
 */
export function Reveal({ children, className, stagger, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduceMotion) return
      const targets = stagger ? Array.from(el.children) : el

      gsap.from(targets, {
        y: 48,
        autoAlpha: 0, // opacity + visibility, so hidden items aren't clickable
        duration: 1,
        ease: 'expo.out',
        stagger: stagger ?? 0,
        delay,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })
    },
    { scope: ref, dependencies: [reduceMotion, stagger, delay] },
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
