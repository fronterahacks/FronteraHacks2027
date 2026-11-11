import { Fragment, useEffect, useState } from 'react'
import { countdown } from '../data/event'
import { GlitchText } from './GlitchText'
import { TerminalWindow } from './Terminal'

const START = countdown.start.getTime()
const END = countdown.end.getTime()

type Phase = 'before' | 'during' | 'after'

/** Splits a duration into days/hours/minutes/seconds, padded to 2 digits. */
function breakdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const pad = (n: number) => String(n).padStart(2, '0')
  return [
    { label: 'DAYS', value: pad(Math.floor(total / 86400)) }, // can be 3 digits
    { label: 'HRS', value: pad(Math.floor((total % 86400) / 3600)) },
    { label: 'MIN', value: pad(Math.floor((total % 3600) / 60)) },
    { label: 'SEC', value: pad(total % 60) },
  ]
}

/** Which stage of the event we're in, how long is left, and progress 0..1. */
function getState(now: number): { phase: Phase; remaining: number; progress: number } {
  if (now < START) return { phase: 'before', remaining: START - now, progress: 0 }
  if (now < END) return { phase: 'during', remaining: END - now, progress: (now - START) / (END - START) }
  return { phase: 'after', remaining: 0, progress: 1 }
}

const STATUS: Record<Phase, { text: string; target: string; color: string }> = {
  before: { text: countdown.messages.before, target: countdown.messages.beforeTarget, color: 'text-fh-purple/80' },
  during: { text: countdown.messages.during, target: countdown.messages.duringTarget, color: 'text-fh-pink' },
  after: { text: countdown.messages.after, target: countdown.messages.afterTarget, color: 'text-fh-purple' },
}

/**
 * "// COUNTDOWN.exe" terminal from the old site:
 * - before the event: counts down to hacking start
 * - during: counts down to submissions closing, progress bar fills
 * - after: shows the closed message
 * Each digit pair glitch-decodes when its value changes.
 */
export function Countdown() {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const { phase, remaining, progress } = getState(now)
  const status = STATUS[phase]
  const units = breakdown(remaining)

  return (
    <TerminalWindow title="// COUNTDOWN.exe" className="w-full max-w-md">
      <div className="flex flex-col items-center gap-5 px-4 py-8 sm:px-6">
        <p className={`font-mono text-xs tracking-widest motion-safe:animate-blink-slow ${status.color}`}>
          {status.text}
        </p>

        <div role="timer" className="flex items-start justify-center gap-1 sm:gap-2">
          {units.map((unit, i) => (
            <Fragment key={unit.label}>
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="font-mono text-3xl font-black text-fh-purple/50 motion-safe:animate-blink sm:text-4xl"
                >
                  :
                </span>
              )}
              <div className="flex min-w-14 flex-col items-center gap-1.5 sm:min-w-16">
                <GlitchText
                  text={unit.value}
                  className="bg-linear-to-b from-white to-fh-lilac bg-clip-text font-mono text-4xl leading-none font-black text-transparent drop-shadow-[0_0_8px_rgb(180_0_255/0.6)] sm:text-5xl"
                />
                <span className="font-mono text-[10px] tracking-[0.2em] text-fh-purple/60">{unit.label}</span>
              </div>
            </Fragment>
          ))}
        </div>

        {/* Progress through the hacking period */}
        <div
          role="progressbar"
          aria-label="Hackathon progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="h-[3px] w-full overflow-hidden rounded-sm bg-fh-purple/15"
        >
          <div
            className="h-full rounded-sm bg-linear-to-r from-fh-purple via-fh-violet to-fh-pink shadow-[0_0_8px_rgb(180_0_255/0.6)] transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <p className="text-center font-mono text-[10px] tracking-widest text-fh-purple/50">{status.target}</p>
      </div>
    </TerminalWindow>
  )
}
