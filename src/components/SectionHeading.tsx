import { useRef } from 'react'
import { useInView } from '../hooks/useInView'
import { useVelocitySkew } from '../hooks/useVelocitySkew'
import { GlitchText } from './GlitchText'
import { Reveal } from './Reveal'
import { RevealText } from './RevealText'

type SectionHeadingProps = {
  /** Section number, shown as "01", "02", ... */
  index: number
  /** Short label, e.g. "About". */
  label: string
  title: string
  className?: string
}

/**
 * Standard opener for every section: a small monospace label
 * ("// 01 — About", the site's subtle cyber accent) that glitch-decodes as it
 * scrolls into view, over a large title that assembles and ignites letter by
 * letter as you scroll (RevealText). The whole heading leans with scroll
 * speed (useVelocitySkew).
 */
export function SectionHeading({ index, label, title, className = '' }: SectionHeadingProps) {
  const labelRef = useRef<HTMLParagraphElement>(null)
  const inView = useInView(labelRef)
  const headerRef = useRef<HTMLElement>(null)
  useVelocitySkew(headerRef)
  const labelText = `${String(index).padStart(2, '0')} — ${label}`

  return (
    <header ref={headerRef} className={`origin-left ${className}`}>
      <Reveal>
        <p ref={labelRef} className="font-mono text-xs tracking-[0.25em] text-white/70 uppercase sm:text-sm">
          <span className="text-fh-purple" aria-hidden="true">
            //{' '}
          </span>
          <span className="sr-only">{labelText}</span>
          {/* Empty (a non-breaking space keeps the line height) until in view,
              then the text "decodes" in. Decorative copy, hidden from screen
              readers, which get the sr-only text above. */}
          <span aria-hidden="true">
            <GlitchText text={inView ? labelText : ' '} stepMs={35} />
          </span>
        </p>
      </Reveal>
      <RevealText
        as="h2"
        className="mt-4 max-w-5xl text-[clamp(2.75rem,8vw,7.5rem)] leading-[0.92] font-semibold tracking-tighter"
      >
        {title}
      </RevealText>
    </header>
  )
}
