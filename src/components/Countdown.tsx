import { useEffect, useState } from 'react'
import { countdown } from '../data/event'
import { useRandomFlicker } from '../hooks/useRandomFlicker'

const START = countdown.start.getTime()
const END = countdown.end.getTime()

type Phase = 'before' | 'during' | 'after'

/** Splits a duration into days/hours/minutes/seconds, padded to 2 digits. */
function breakdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const pad = (n: number) => String(n).padStart(2, '0')
  return [
    { label: 'Days', value: pad(Math.floor(total / 86400)) }, // can be 3 digits
    { label: 'Hours', value: pad(Math.floor((total % 86400) / 3600)) },
    { label: 'Minutes', value: pad(Math.floor((total % 3600) / 60)) },
    { label: 'Seconds', value: pad(total % 60) },
  ]
}

/** Which stage of the event we're in, how long is left, and progress 0..1. */
function getState(now: number): { phase: Phase; remaining: number; progress: number } {
  if (now < START) return { phase: 'before', remaining: START - now, progress: 0 }
  if (now < END) return { phase: 'during', remaining: END - now, progress: (now - START) / (END - START) }
  return { phase: 'after', remaining: 0, progress: 1 }
}

const LABELS: Record<Phase, { lead: string; target: string }> = {
  before: { lead: countdown.messages.before, target: countdown.messages.beforeTarget },
  during: { lead: countdown.messages.during, target: countdown.messages.duringTarget },
  after: { lead: countdown.messages.after, target: countdown.messages.afterTarget },
}

/**
 * One digit in its own clipped slot. When the digit changes, React remounts
 * the inner span (its `key` is the digit), which replays the slide-up
 * animation, so each change rolls in like an odometer.
 *
 * The slot is padded (and pulled back with an equal negative margin, so
 * layout doesn't change) to leave room for the neon glow, which the clip
 * would otherwise cut off at the edges.
 */
function Digit({ value }: { value: string }) {
  return (
    <span className="relative -m-[0.35em] inline-block overflow-hidden p-[0.35em]">
      <span key={value} className="inline-block motion-safe:animate-digit-in">
        {value}
      </span>
    </span>
  )
}

/**
 * Oversized countdown: giant neon numerals that roll in as they change and
 * flicker at random like a real neon sign, a small eyebrow label above, unit
 * names below, and a glowing hairline progress bar that fills during the
 * hacking window.
 */
export function Countdown() {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const { phase, remaining, progress } = getState(now)
  const label = LABELS[phase]
  const units = breakdown(remaining)
  const flicker = useRandomFlicker(units.length)

  return (
    <div className="w-full">
      {/* Eyebrow row */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase sm:text-xs">
        <span>
          <span className="text-fh-purple">// </span>
          {label.lead}
        </span>
        <span>{label.target}</span>
      </div>

      {/* Numerals */}
      <div role="timer" className="mt-3 grid grid-cols-4 gap-2 sm:gap-6">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex flex-col items-start">
            <span
              aria-hidden="true"
              className={`text-[clamp(2.75rem,13vw,10rem)] leading-[0.9] font-semibold tracking-tighter tabular-nums text-neon ${
                flicker === 'all' || flicker === i
                  ? 'motion-safe:animate-neon-flicker'
                  : 'motion-safe:animate-neon-hum'
              }`}
            >
              {Array.from(unit.value).map((d, i) => (
                <Digit key={`${unit.label}-${i}`} value={d} />
              ))}
            </span>
            <span className="mt-2 font-mono text-[10px] tracking-[0.2em] text-fh-lilac/60 uppercase drop-shadow-[0_0_6px_rgb(180_0_255/0.6)] sm:text-xs">
              {unit.label}
            </span>
          </div>
        ))}
        {/* Screen readers get one readable sentence instead of digit spans */}
        <span className="sr-only">
          {label.lead} {units.map((u) => `${Number(u.value)} ${u.label}`).join(', ')}
        </span>
      </div>

      {/* Hairline progress through the hacking window */}
      <div
        role="progressbar"
        aria-label="Hackathon progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="mt-6 h-px w-full bg-white/10"
      >
        <div
          className="h-full bg-linear-to-r from-fh-purple via-fh-violet to-fh-pink shadow-[0_0_10px_rgb(255_0_200/0.8)] transition-[width] duration-1000 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}
