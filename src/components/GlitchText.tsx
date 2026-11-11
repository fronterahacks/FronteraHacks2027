import { useGlitchText } from '../hooks/useGlitchText'

type GlitchTextProps = {
  text: string
  /** Milliseconds between each character locking in (default 40). */
  stepMs?: number
  /** Change this number to replay the effect on the same text (e.g. on hover). */
  replay?: number
  className?: string
}

/**
 * Inline text that glitch-decodes whenever it changes
 * (characters scramble through @#$%&* then lock in left to right).
 *
 * Screen readers get the real text (visually hidden) and skip the
 * scrambled version, so they never read out "@#$%".
 */
export function GlitchText({ text, stepMs, replay, className }: GlitchTextProps) {
  const display = useGlitchText(text, stepMs, replay)
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  )
}
