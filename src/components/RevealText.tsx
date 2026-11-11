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
}

/**
 * Text that assembles itself as you scroll it into view: each character
 * rises out of its line's mask while flipping up from flat in 3D and going
 * from blurred to sharp, cascading left to right.
 *
 * The animation is *scrubbed*: tied to scroll position rather than played
 * once, so the reader drives it, and it folds away again if they scroll back.
 * `scrub: 1` adds a one-second catch-up so it glides instead of jittering.
 *
 * GSAP SplitText finds the real visual lines (they depend on screen width),
 * masks each line, and re-splits on resize / font load (autoSplit). Text stays
 * readable to screen readers. Reduced motion: plain text, no animation.
 */
export function RevealText({ children, as = 'h2', className }: RevealTextProps) {
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduceMotion) return

      SplitText.create(el, {
        type: 'lines,words,chars',
        mask: 'lines',
        autoSplit: true,
        // Returning the animation lets SplitText rebuild it after a re-split.
        onSplit: (self) => {
          // Tight headline leading would let the masks clip descenders
          // (y, g, p): pad each mask down a touch, pulled back by an equal
          // negative margin so the layout doesn't move.
          gsap.set(self.masks, { paddingBottom: '0.12em', marginBottom: '-0.12em' })
          // Depth for the 3D flip: perspective on each line, chars hinge on
          // their bottom edge.
          gsap.set(self.lines, { perspective: 900 })
          gsap.set(self.chars, { transformOrigin: '50% 100%' })

          return gsap.from(self.chars, {
            yPercent: 110,
            rotateX: -85,
            opacity: 0,
            filter: 'blur(10px)',
            ease: 'power3.out',
            stagger: { each: 0.035, from: 'start' },
            scrollTrigger: {
              trigger: el,
              start: 'top 92%', // begins as the title peeks in at the bottom
              end: 'top 45%', // fully assembled a bit above the middle
              scrub: 1,
            },
          })
        },
      })
      // useGSAP reverts the split and its animation automatically on cleanup.
    },
    { scope: ref, dependencies: [children, reduceMotion] },
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
