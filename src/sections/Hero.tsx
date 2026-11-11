import type { ReactNode } from 'react'
import logo from '../assets/brand/frontera-hacks-logo.png'
import { event, hero } from '../data/event'

/**
 * First screen: date + location, the Frontera Hacks logo, tagline, and the
 * "Spark your curiosity" call to action. Layout follows the placeholder
 * site's hero, centred and stacked.
 *
 * `children` is a slot between the tagline and the call to action, where
 * the countdown terminal goes.
 */
export function Hero({ children }: { children?: ReactNode }) {
  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col items-center justify-center gap-10 px-4 pt-28 pb-16 text-center md:pt-32"
    >
      <div className="flex w-full max-w-3xl flex-col items-center gap-5">
        {/* Date + location: monospace, soft neon glow */}
        <p className="font-mono text-xs tracking-[0.2em] text-[rgb(226_145_255/0.91)] uppercase drop-shadow-[0_0_6px_rgb(180_0_255/0.4)] sm:text-sm">
          {event.dateLabel}
          <span aria-hidden="true" className="mx-3 text-fh-purple">
            //
          </span>
          {event.location}
        </p>

        {/* The logo is the page's main heading. alt text gives screen readers
            and search engines the real name. */}
        <h1 className="w-full">
          <img
            src={logo}
            alt={`${event.name} ${event.year}`}
            width={1278}
            height={105}
            className="mx-auto w-full drop-shadow-[0_0_18px_rgb(180_0_255/0.35)]"
          />
        </h1>

        <p className="text-xl font-light text-white/90 sm:text-2xl md:text-3xl">{event.tagline}</p>

        {/* Only shown once a real registration link is set in event.ts */}
        {event.registerUrl && (
          <a
            href={event.registerUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 rounded-full border border-fh-purple bg-fh-purple/10 px-8 py-3 font-mono text-sm tracking-[0.2em] text-white transition hover:bg-fh-purple/25 hover:shadow-[0_0_24px_rgb(180_0_255/0.5)]"
          >
            &gt; REGISTER
          </a>
        )}
      </div>

      {children}

      {/* Call to action */}
      <div className="flex max-w-2xl flex-col items-center gap-3">
        <h2 className="text-2xl font-semibold sm:text-3xl">
          {hero.ctaLead} <span className="text-fh-gradient">{hero.ctaHighlight}</span>
        </h2>
        <p className="text-base text-white/70 sm:text-lg">{hero.subline}</p>
        <div
          aria-hidden="true"
          className="mt-3 h-px w-48 bg-linear-to-r from-transparent via-fh-purple to-transparent opacity-60"
        />
      </div>
    </section>
  )
}
