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
 * ("// 01 — About", the site's subtle cyber accent) over a large title whose
 * lines mask up into view as the section scrolls in.
 */
export function SectionHeading({ index, label, title, className = '' }: SectionHeadingProps) {
  return (
    <header className={className}>
      <Reveal>
        <p className="font-mono text-xs tracking-[0.25em] text-white/70 uppercase sm:text-sm">
          <span className="text-fh-purple">// </span>
          {String(index).padStart(2, '0')} — {label}
        </p>
      </Reveal>
      <RevealText
        as="h2"
        delay={0.1}
        className="mt-4 max-w-5xl text-[clamp(2.75rem,8vw,7.5rem)] leading-[0.92] font-semibold tracking-tighter"
      >
        {title}
      </RevealText>
    </header>
  )
}
