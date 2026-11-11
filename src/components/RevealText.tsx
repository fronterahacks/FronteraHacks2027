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
/** Unread words in paragraph mode. */
const PARAGRAPH_DIM = 'rgba(255, 255, 255, 0.16)'

type Variant = 'title' | 'paragraph'

type RevealTextProps = {
  children: string
  /** Which element to render. Defaults to h2 (section titles). */
  as?: 'h1' | 'h2' | 'h3' | 'p'
  /**
   * 'title' (default): per-letter 3D flip + neon ignition, for short headings.
   * 'paragraph': lighter, for body copy; lines rise, then words light up from
   * dim to their normal colour as you scroll, so the text "reads itself".
   */
  variant?: Variant
  className?: string
}

/** Title: letters assemble in 3D, then ignite like a neon sign. */
function titleReveal(self: SplitText, trigger: Element) {
  // Tight headline leading would let the masks clip descenders (y, g, p):
  // pad each mask down a touch, pulled back by an equal negative margin.
  gsap.set(self.masks, { paddingBottom: '0.12em', marginBottom: '-0.12em' })
  // Depth for the 3D flip: perspective per line, chars hinge on their bottom.
  gsap.set(self.lines, { perspective: 900 })
  gsap.set(self.chars, { transformOrigin: '50% 100%' })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
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

  // 2. Ignite: letters land dim, then light up one by one like a neon sign
  //    switching on: a hot-pink flash that settles into white.
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
}

/** Paragraph: lines rise from their masks, then words light up in order. */
function paragraphReveal(self: SplitText, trigger: Element) {
  gsap.set(self.masks, { paddingBottom: '0.1em', marginBottom: '-0.1em' })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: 'top 88%',
      end: 'bottom 55%', // the last word lights as the paragraph's end passes mid-screen
      scrub: 1,
    },
  })

  tl.from(self.lines, { yPercent: 100, opacity: 0, ease: 'power3.out', stagger: 0.08 }, 0)
  // `from` a dim colour: each word animates to whatever colour the element
  // already has (set with a class), so styling stays in the markup.
  tl.from(self.words, { color: PARAGRAPH_DIM, ease: 'none', stagger: 0.05 }, 0.15)

  return tl
}

/**
 * Text that builds itself as you scroll it into view (see `variant`).
 *
 * The animation is *scrubbed*: tied to scroll position rather than played
 * once, so the reader drives it, and it reverses if they scroll back.
 * `scrub: 1` adds a one-second catch-up so it glides instead of jittering.
 *
 * GSAP SplitText finds the real visual lines (they depend on screen width),
 * masks each line, and re-splits on resize / font load (autoSplit). Text stays
 * readable to screen readers. Reduced motion: plain text, no animation.
 */
export function RevealText({ children, as = 'h2', variant = 'title', className }: RevealTextProps) {
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || reduceMotion) return

      SplitText.create(el, {
        type: variant === 'title' ? 'lines,words,chars' : 'lines,words',
        mask: 'lines',
        autoSplit: true,
        // Returning the animation lets SplitText rebuild it after a re-split.
        onSplit: (self) => (variant === 'title' ? titleReveal(self, el) : paragraphReveal(self, el)),
      })
      // useGSAP reverts the split and its animation automatically on cleanup.
    },
    { scope: ref, dependencies: [children, reduceMotion, variant] },
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
