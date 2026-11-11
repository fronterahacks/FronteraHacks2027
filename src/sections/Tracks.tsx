import { Reveal } from '../components/Reveal'
import { RevealText } from '../components/RevealText'
import { SectionHeading } from '../components/SectionHeading'
import { tracks } from '../data/event'

/**
 * Tracks: numbered heading, a short intro, then each track as a huge
 * full-width row (number, name, toggle mark) separated by hairlines. Rows
 * stagger in as you scroll.
 */
export function Tracks({ index }: { index: number }) {
  return (
    <section id="tracks" className="scroll-mt-20 px-5 py-28 sm:px-8 md:px-12 md:py-40">
      <SectionHeading index={index} label="Tracks" title={tracks.title} />

      <RevealText
        as="p"
        variant="paragraph"
        className="mt-10 max-w-2xl text-xl text-white/75 sm:text-2xl md:mt-14"
      >
        {tracks.intro}
      </RevealText>

      <Reveal stagger={0.12} className="mt-16 border-b border-white/10 md:mt-24">
        {tracks.items.map((track) => (
          <div key={track.number} className="border-t border-white/10">
            <div className="flex items-center gap-5 py-7 sm:gap-10 md:py-10">
              <span className="w-8 shrink-0 font-mono text-sm tracking-[0.2em] text-fh-purple sm:w-12">
                {track.number}
              </span>
              <h3 className="flex-1 text-[clamp(2.25rem,7vw,6.5rem)] leading-[0.95] font-semibold tracking-tighter">
                {track.name}
              </h3>
              <span aria-hidden="true" className="font-mono text-3xl text-white/50 sm:text-4xl">
                +
              </span>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
