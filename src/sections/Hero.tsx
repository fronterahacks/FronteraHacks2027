import type { CSSProperties, ReactNode } from 'react'
import logo from '../assets/brand/frontera-hacks-logo.png'
import { event, hero } from '../data/event'

/** Stagger helper: each revealed line starts a bit after the previous one. */
const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` })

/**
 * Full-screen hero, modern layout:
 * - content anchored bottom-left, leaving open space for the 3D scene
 * - oversized headline whose lines mask up into view on load
 * - small monospace eyebrow, then a dark glass panel holding the meta row
 *   (subline, date, location, button) and, below a divider, `children`
 *   (the countdown), so everything stays readable over the 3D scene
 */
export function Hero({ children }: { children?: ReactNode }) {
  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col justify-end px-5 pt-28 pb-10 sm:px-8 md:px-12 md:pb-14"
    >
      {/* Brand wordmark */}
      <div className="overflow-hidden">
        <img
          src={logo}
          alt=""
          width={1278}
          height={105}
          className="w-64 opacity-90 motion-safe:animate-rise-in sm:w-80 md:w-96"
          style={delay(0.1)}
        />
      </div>

      {/* Eyebrow */}
      <p className="mt-8 overflow-hidden font-mono text-xs tracking-[0.25em] text-white/70 uppercase sm:text-sm">
        <span className="inline-block motion-safe:animate-rise-in" style={delay(0.2)}>
          <span className="text-fh-purple">// </span>
          {hero.eyebrow}
        </span>
      </p>

      {/* Headline. Each line is clipped (overflow-hidden) so the text slides
          up from behind an invisible edge. Screen readers get the full name. */}
      <h1 className="mt-3 text-[clamp(3.5rem,13vw,12rem)] leading-[0.88] font-semibold tracking-tighter">
        <span className="sr-only">
          {event.name} {event.year}:{' '}
        </span>
        {hero.headline.map((line, i) => (
          <span key={line.text} className="block overflow-hidden pb-[0.08em]">
            <span
              className={`inline-block motion-safe:animate-rise-in ${'highlight' in line ? 'text-fh-gradient' : ''}`}
              style={delay(0.3 + i * 0.12)}
            >
              {line.text}
            </span>
          </span>
        ))}
      </h1>

      {/* One dark "smoked glass" panel from the subline down through the
          countdown, so the text stays readable when the scattered mascot
          cubes drift behind it. Same layered glass recipe as the nav (blur +
          saturate, top highlight, soft shadow), but tinted dark. */}
      <div
        className="mt-10 rounded-2xl border border-white/10 bg-fh-bg/55 p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_12px_40px_rgb(0_0_0/0.45)] backdrop-blur-xl backdrop-saturate-150 motion-safe:animate-fade-in sm:p-6 md:px-8"
        style={delay(0.7)}
      >
        {/* Meta row */}
        <div className="grid gap-6 md:grid-cols-[1fr_auto_auto] md:items-end md:gap-12">
          <p className="max-w-md text-base text-white/70 sm:text-lg">{hero.subline}</p>

          <dl className="flex gap-10 font-mono text-xs tracking-[0.2em] uppercase sm:text-sm">
            <div>
              <dt className="text-white/60">Date</dt>
              <dd className="mt-1 text-white">{event.dateLabel}</dd>
            </div>
            <div>
              <dt className="text-white/60">Location</dt>
              <dd className="mt-1 text-white">{event.location}</dd>
            </div>
          </dl>

          {event.registerUrl ? (
            <a
              href={event.registerUrl}
              target="_blank"
              rel="noreferrer"
              className="justify-self-start rounded-full bg-white px-7 py-3 text-sm font-semibold text-fh-bg transition hover:bg-fh-lilac"
            >
              Register →
            </a>
          ) : (
            <a
              href="#about"
              className="justify-self-start rounded-full border border-white/20 px-6 py-3 font-mono text-xs tracking-[0.2em] text-white/85 uppercase sm:text-sm transition hover:border-white/60 hover:text-white"
            >
              {hero.scrollHint} ↓
            </a>
          )}
        </div>

        {/* Countdown (or whatever is passed in), below a hairline divider */}
        {children && (
          <div className="mt-6 border-t border-white/10 pt-8 sm:mt-8 sm:pt-10">{children}</div>
        )}
      </div>
    </section>
  )
}
