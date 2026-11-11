import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

type RevealTextProps = {
  children: string
  /** Which element to render. Defaults to h2 (section titles). */
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  /** Seconds to wait after it enters view (to sequence with other reveals). */
  delay?: number
}

/**
 * Text whose lines slide up from behind invisible masks when it scrolls into
 * view: the same reveal as the hero headline, for any heading or paragraph.
 *
 * GSAP SplitText finds the real visual line breaks (which depend on screen
 * width), wraps each line in a clipping mask, and re-splits automatically on
 * resize and when web fonts finish loading (autoSplit). It also keeps the
 * text readable to screen readers (aria-label on the element, split pieces
 * hidden). Plays once. Reduced motion: plain text, no animation.
 */
export function RevealText({ children, as = 'h2', className, delay = 0 }: RevealTextProps) {
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduceMotion) return

      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        // Returning the animation lets SplitText rebuild it after a re-split.
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 115,
            duration: 1.1,
            ease: 'expo.out',
            stagger: 0.09,
            delay,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          }),
      })
      // useGSAP reverts the split and its animation automatically on cleanup.
    },
    { scope: ref, dependencies: [children, reduceMotion, delay] },
  )

  const Tag = as
  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        ref.current = node
      }}
      className={className}
    >
      {children}
    </Tag>
  )
}
