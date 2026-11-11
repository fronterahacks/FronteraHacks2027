import footerLogo from '../assets/brand/frontera-hacks-footer-logo.png'
import { Magnetic } from '../components/Magnetic'
import { Reveal } from '../components/Reveal'
import { RevealText } from '../components/RevealText'
import { event, footer, socials } from '../data/event'

/**
 * Footer in two parts:
 * 1. The finale stage (one screen tall): sign-off headline, date/location
 *    and a call to action at the top; the lower half is left open for the 3D
 *    frontier horizon where the mascot reassembles (marked data-finale-stage
 *    so the 3D scene can measure it).
 * 2. A glass bottom bar: logo, socials, contact, code of conduct, credit.
 */
export function Footer() {
  const instagram = socials.find((s) => s.name === 'Instagram' && s.url)
  const cta = event.registerUrl
    ? { href: event.registerUrl, label: event.registerLabel }
    : instagram?.url
      ? { href: instagram.url, label: footer.updatesLabel }
      : null

  return (
    <footer id="footer" className="relative">
      {/* 1. Finale stage */}
      <div data-finale-stage className="flex min-h-svh flex-col items-center px-5 pt-32 text-center sm:px-8 md:px-12 md:pt-40">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.25em] text-white/70 uppercase sm:text-sm">
            <span className="text-fh-purple">// </span>
            {footer.eyebrow}
          </p>
        </Reveal>
        <RevealText
          as="h2"
          className="mt-4 max-w-5xl text-[clamp(3rem,9vw,8.5rem)] leading-[0.9] font-semibold tracking-tighter text-balance"
        >
          {footer.headline}
        </RevealText>
        <Reveal className="mt-8 flex flex-col items-center gap-6">
          <p className="font-mono text-xs tracking-[0.2em] text-white/70 uppercase sm:text-sm">
            {event.dateLabel} <span className="mx-2 text-fh-purple">·</span> {event.location}
          </p>
          {cta && (
            <Magnetic>
              <a
                href={cta.href}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-semibold text-fh-bg transition-colors hover:bg-fh-lilac"
              >
                {cta.label}
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">
                  →
                </span>
              </a>
            </Magnetic>
          )}
        </Reveal>
        {/* The lower half of this screen is the 3D horizon's stage. */}
      </div>

      {/* 2. Bottom bar */}
      <div className="px-5 pb-8 sm:px-8 md:px-12">
        <div className="grid gap-8 rounded-3xl border border-white/10 bg-fh-bg/60 p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-xl sm:p-8 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-12">
          <img src={footerLogo} alt={event.name} width={313} height={35} className="h-7 w-auto opacity-90" />

          <div className="flex flex-col gap-2 text-sm text-white/60 md:items-center">
            <p>
              {footer.helpText}{' '}
              <a href={`mailto:${event.contactEmail}`} className="text-fh-lilac underline-offset-4 hover:text-white hover:underline">
                {event.contactEmail}
              </a>
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <span>{footer.credit}</span>
              <a
                href={event.codeOfConductUrl}
                target="_blank"
                rel="noreferrer"
                className="text-white/80 underline-offset-4 hover:text-white hover:underline"
              >
                {footer.codeOfConductLabel}
              </a>
            </p>
          </div>

          <ul className="flex gap-3">
            {socials
              .filter((s) => s.url)
              .map((s) => (
                <li key={s.name}>
                  <a
                    href={s.url!}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.name}
                    className="flex size-11 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-fh-purple hover:bg-fh-purple/20"
                  >
                    <img src={s.icon} alt="" className="size-5" />
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
