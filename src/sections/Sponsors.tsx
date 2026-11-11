import { Reveal } from '../components/Reveal'
import { RevealText } from '../components/RevealText'
import { SectionHeading } from '../components/SectionHeading'
import { sponsors, type Sponsor } from '../data/event'

/**
 * Sponsors: numbered heading, intro, then a grid of glass sponsor cards.
 * The grid adapts to the count: one sponsor gets a single wide card, more
 * sponsors flow into 2-3 columns.
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
          <SponsorCard key={sponsor.name} sponsor={sponsor} wide={count === 1} />
        ))}
      </Reveal>
    </section>
  )
}

/**
 * One sponsor on a dark glass card. Shows the logo if there is one,
 * otherwise the name as a large wordmark. Becomes a link once `url` is set.
 */
function SponsorCard({ sponsor, wide }: { sponsor: Sponsor; wide: boolean }) {
  const content = sponsor.logo ? (
    <img src={sponsor.logo} alt={sponsor.name} loading="lazy" className="max-h-28 w-auto max-w-[70%] object-contain" />
  ) : (
    <span className="text-center text-[clamp(2rem,6vw,5.5rem)] leading-[0.95] font-semibold tracking-tighter text-balance">
      {sponsor.name}
    </span>
  )

  const className = `relative flex items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-fh-bg/55 px-8 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_20px_60px_rgb(0_0_0/0.45)] backdrop-blur-xl backdrop-saturate-150 ${
    wide ? 'min-h-[22rem] md:min-h-[28rem]' : 'aspect-[16/10]'
  }`

  return sponsor.url ? (
    <a href={sponsor.url} target="_blank" rel="noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  )
}
