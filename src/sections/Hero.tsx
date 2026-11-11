import type { CSSProperties } from 'react'
import logo from '../assets/brand/frontera-hacks-logo.png'
import { event, hero } from '../data/event'

/** Stagger helper: each revealed line starts a bit after the previous one. */
const delay = (seconds: number): CSSProperties => ({ animationDelay: `${seconds}s` })

/**
 * Full-screen hero, modern layout:
 * - content anchored bottom-left, leaving open space for the 3D scene
 * - oversized headline whose lines mask up into view on load
 * - small monospace eyebrow + a meta row (date, location, scroll hint)
 */
export function Hero() {
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
          className="w-56 opacity-90 motion-safe:animate-rise-in sm:w-72 md:w-80"
          style={delay(0.1)}
        />
      </div>

      {/* Eyebrow */}
      <p className="mt-8 overflow-hidden font-mono text-[11px] tracking-[0.25em] text-white/60 uppercase sm:text-xs">
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

      {/* Meta row */}
      <div
        className="mt-10 grid gap-6 border-t border-white/10 pt-6 motion-safe:animate-fade-in md:grid-cols-[1fr_auto_auto] md:items-end md:gap-12"
        style={delay(0.7)}
      >
        <p className="max-w-md text-base text-white/70 sm:text-lg">{hero.subline}</p>

        <dl className="flex gap-10 font-mono text-xs tracking-[0.2em] uppercase">
          <div>
            <dt className="text-white/40">Date</dt>
            <dd className="mt-1 text-white">{event.dateLabel}</dd>
          </div>
          <div>
            <dt className="text-white/40">Location</dt>
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
            className="justify-self-start rounded-full border border-white/20 px-6 py-3 font-mono text-xs tracking-[0.2em] text-white/80 uppercase transition hover:border-white/60 hover:text-white"
          >
            {hero.scrollHint} ↓
          </a>
        )}
      </div>
    </section>
  )
}
