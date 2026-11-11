/**
 * How far the footer's finale stage ([data-finale-stage]) has scrolled into
 * view: 0 while its top edge is at or below the bottom of the screen, 1 once
 * its top edge reaches the top. Every part of the 3D finale (terrain rising,
 * sun, horizon pulse, mascot reassembling) is driven by this one number.
 * Measured live each frame, so it adapts to any layout change.
 */
export function finaleProgress() {
  const stage = document.querySelector('[data-finale-stage]')
  if (!stage) return 0
  const top = stage.getBoundingClientRect().top
  return Math.min(1, Math.max(0, 1 - top / window.innerHeight))
}

/** Ease-out cubic: fast start, gentle landing. */
export const easeOut = (t: number) => 1 - (1 - t) ** 3
