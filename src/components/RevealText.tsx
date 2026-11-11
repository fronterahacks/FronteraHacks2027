import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

// Neon ignition colours. Shadows use the same two-layer shape on and off so
// GSAP can tween between them smoothly.
const DIM = 'rgba(255, 255, 255, 0.28)'
const GLOW_ON = '0 0 12px rgba(255, 0, 200, 0.95), 0 0 34px rgba(180, 0, 255, 0.8)'
const GLOW_OFF = '0 0 0px rgba(255, 0, 200, 0), 0 0 0px rgba(180, 0, 255, 0)'

type RevealTextProps = {
  children: string
  /** Which element to render. Defaults to h2 (section titles). */
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
}

/**
 * Text that assembles itself as you scroll it into view:
 * 1. each character rises out of its line's mask while flipping up from flat
 *    in 3D and going from blurred to sharp, cascading left to right;
 * 2. then the letters "ignite" one by one, dim -> hot-pink neon flash ->
 *    white, like a neon sign switching on along the word.
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

          // One scrubbed timeline, so a re-split rebuilds everything at once.
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: 'top 92%', // begins as the title peeks in at the bottom
              end: 'top 30%', // fully lit a bit above the middle
              scrub: 1,
            },
          })

          // 1. Assemble: rise, flip up and sharpen, cascading left to right.
          tl.from(
            self.chars,
            {
              yPercent: 110,
              rotateX: -85,
              opacity: 0,
              filter: 'blur(10px)',
              ease: 'power3.out',
              stagger: { each: 0.035, from: 'start' },
            },
            0,
          )

          // 2. Ignite: letters land dim, then light up one by one like a neon
          //    sign switching on: a hot-pink flash that settles into white.
          gsap.set(self.chars, { color: DIM, textShadow: GLOW_OFF })
          tl.to(
            self.chars,
            {
              keyframes: [
                { color: '#ff9bef', textShadow: GLOW_ON, ease: 'power1.in' },
                { color: '#ffffff', textShadow: GLOW_OFF, ease: 'power2.out' },
              ],
              stagger: { each: 0.045, from: 'start' },
            },
            0.35, // overlaps the end of the assembly
          )

          return tl
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
