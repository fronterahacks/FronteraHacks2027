import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/** Characters cycled through while text is "decoding" (from the old site). */
export const GLITCH_CHARS = '@#$%&*!?/\\|<>[]{}~^'

function randomChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
}

/**
 * Returns `text` with a glitch-decode effect: whenever `text` changes, the
 * characters scramble and then lock in left to right, one every `stepMs`.
 * Spaces stay spaces so words keep their shape. With reduced motion on,
 * the real text is returned immediately.
 */
export function useGlitchText(text: string, stepMs = 40) {
  const reduceMotion = usePrefersReducedMotion()
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    if (reduceMotion) return

    let revealed = 0
    const id = window.setInterval(() => {
      revealed++
      if (revealed > text.length) {
        window.clearInterval(id)
        setDisplay(text)
        return
      }
      setDisplay(
        Array.from(text, (c, i) => (i < revealed || c === ' ' ? c : randomChar())).join(''),
      )
    }, stepMs)

    return () => window.clearInterval(id)
  }, [text, stepMs, reduceMotion])

  return reduceMotion ? text : display
}
