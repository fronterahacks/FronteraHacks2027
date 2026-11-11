import { useGlitchText } from '../hooks/useGlitchText'

type GlitchTextProps = {
  text: string
  /** Milliseconds between each character locking in (default 40). */
  stepMs?: number
  className?: string
}

/**
 * Inline text that glitch-decodes whenever it changes
 * (characters scramble through @#$%&* then lock in left to right).
 *
 * Screen readers get the real text (visually hidden) and skip the
 * scrambled version, so they never read out "@#$%".
 */
export function GlitchText({ text, stepMs, className }: GlitchTextProps) {
  const display = useGlitchText(text, stepMs)
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  )
}
