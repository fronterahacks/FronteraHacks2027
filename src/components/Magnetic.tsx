import { gsap } from 'gsap'
import { useRef, type PointerEvent, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type MagneticProps = {
  children: ReactNode
  /** How far toward the cursor it moves, as a share of the cursor offset. */
  strength?: number
  /** Classes for the outer zone (e.g. grid/flex alignment of the button). */
  className?: string
}

/**
 * Makes a button lean toward the cursor while it's near, then spring back
 * with a small elastic wobble when it leaves.
 *
 * The outer span is a still "pull zone" (padding extends it ~16px past the
 * button, cancelled by an equal negative margin so layout is unchanged); only
 * the inner span moves, so the zone doesn't drift and jitter. Mouse only;
 * off with reduced motion.
 */
export function Magnetic({ children, strength = 0.35, className = '' }: MagneticProps) {
  const inner = useRef<HTMLSpanElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  const onPointerMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (e.pointerType !== 'mouse' || reduceMotion || !inner.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    gsap.to(inner.current, { x: dx * strength, y: dy * strength, duration: 0.4, ease: 'power3.out' })
  }

  const onPointerLeave = () => {
    if (!inner.current) return
    gsap.to(inner.current, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' })
  }

  return (
    <span
      className={`-m-4 inline-block p-4 ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <span ref={inner} className="inline-block">
        {children}
      </span>
    </span>
  )
}
