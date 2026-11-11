import { Reveal } from '../components/Reveal'
import { RevealText } from '../components/RevealText'
import { SectionHeading } from '../components/SectionHeading'
import { sponsors, type Sponsor } from '../data/event'
import { useTilt } from '../hooks/useTilt'

/**
 * Sponsors: numbered heading, intro, then a grid of glass sponsor cards.
 * The grid adapts to the count: one sponsor gets a single wide card, more
 * sponsors flow into 2-3 columns. Ends with a "Become a sponsor" call to
 * action that opens a pre-filled email.
 */
export function Sponsors({ index }: { index: number }) {
  const count = sponsors.items.length
  const columns = count === 1 ? '' : count === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'

  return (
    <section id="sponsors" className="scroll-mt-20 px-5 py-28 sm:px-8 md:px-12 md:py-40">
      <SectionHeading index={index} label="Sponsors" title={sponsors.title} />

      <RevealText
        as="p"
        variant="paragraph"
        className="mt-10 max-w-2xl text-xl text-white/75 sm:text-2xl md:mt-14"
      >
        {sponsors.intro}
      </RevealText>

      <Reveal className="mt-16 md:mt-24">
        <p className="font-mono text-xs tracking-[0.25em] text-white/70 uppercase sm:text-sm">
          <span className="text-fh-purple">// </span>
          {sponsors.thanksLabel}
        </p>
      </Reveal>

      <Reveal stagger={0.12} className={`mt-8 grid gap-6 ${columns}`}>
        {sponsors.items.map((sponsor) => (
          // Wrapper takes Reveal's entrance transform (GSAP leaves it inline),
          // so it doesn't override the card's own tilt transform.
          <div key={sponsor.name}>
            <SponsorCard sponsor={sponsor} wide={count === 1} />
          </div>
        ))}
      </Reveal>

      {/* Become a sponsor */}
      <Reveal className="mt-20 md:mt-28">
        <div className="flex flex-col gap-8 rounded-3xl border border-white/10 bg-linear-to-br from-fh-purple/15 via-fh-bg/60 to-fh-pink/10 p-8 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-xl sm:p-10 md:flex-row md:items-center md:justify-between md:p-14">
          <h3 className="max-w-2xl text-3xl leading-[1.05] font-semibold tracking-tighter text-balance sm:text-4xl md:text-5xl">
            {sponsors.cta.title}
          </h3>
          <a
            href={sponsors.cta.href}
            className="group inline-flex shrink-0 items-center gap-3 self-start rounded-full bg-white px-8 py-4 text-base font-semibold text-fh-bg transition-colors hover:bg-fh-lilac md:self-auto"
          >
            {sponsors.cta.button}
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </a>
        </div>
      </Reveal>
    </section>
  )
}

/**
 * One sponsor on a dark glass card. Shows the logo if there is one,
 * otherwise the name as a large wordmark. Becomes a link once `url` is set.
 * Tilts toward the cursor with a glare that follows it (useTilt).
 */
function SponsorCard({ sponsor, wide }: { sponsor: Sponsor; wide: boolean }) {
  const tilt = useTilt()
  const content = sponsor.logo ? (
    <img src={sponsor.logo} alt={sponsor.name} loading="lazy" className="max-h-28 w-auto max-w-[70%] object-contain" />
  ) : (
    <span className="text-center text-[clamp(2rem,6vw,5.5rem)] leading-[0.95] font-semibold tracking-tighter text-balance">
      {sponsor.name}
    </span>
  )

  // Tilts toward the cursor via --rx/--ry (useTilt); eases back on leave.
  const className = `relative flex items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-fh-bg/55 px-8 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_20px_60px_rgb(0_0_0/0.45)] backdrop-blur-xl backdrop-saturate-150 [transform:perspective(1200px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] transition-transform duration-300 ease-out ${
    wide ? 'min-h-[22rem] md:min-h-[28rem]' : 'aspect-[16/10]'
  }`

  // Soft light that follows the cursor across the glass.
  const glare = (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[var(--glare,0)] transition-opacity duration-500 [background:radial-gradient(600px_circle_at_var(--gx,50%)_var(--gy,50%),rgb(255_255_255/0.12),rgb(180_0_255/0.08)_35%,transparent_65%)]"
    />
  )

  return sponsor.url ? (
    <a href={sponsor.url} target="_blank" rel="noreferrer" className={className} {...tilt}>
      {glare}
      {content}
    </a>
  ) : (
    <div className={className} {...tilt}>
      {glare}
      {content}
    </div>
  )
}
