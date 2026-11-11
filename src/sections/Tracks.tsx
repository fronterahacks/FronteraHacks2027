import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useId, useState } from 'react'
import { Reveal } from '../components/Reveal'
import { RevealText } from '../components/RevealText'
import { SectionHeading } from '../components/SectionHeading'
import { tracks, type Track } from '../data/event'

/**
 * Tracks: numbered heading, a short intro, then each track as a huge
 * full-width row between hairlines. Clicking a row expands its description
 * (one open at a time). Rows stagger in as you scroll.
 */
export function Tracks({ index }: { index: number }) {
  const [open, setOpen] = useState<string | null>(null)

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
          <TrackRow
            key={track.number}
            track={track}
            open={open === track.number}
            onToggle={() => setOpen((current) => (current === track.number ? null : track.number))}
          />
        ))}
      </Reveal>
    </section>
  )
}

function TrackRow({ track, open, onToggle }: { track: Track; open: boolean; onToggle: () => void }) {
  const panelId = useId()
  const buttonId = useId()

  return (
    <div className="border-t border-white/10">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center gap-5 py-7 text-left sm:gap-10 md:py-10"
        >
          <span className="w-8 shrink-0 font-mono text-sm tracking-[0.2em] text-fh-purple sm:w-12">
            {track.number}
          </span>
          <span className="flex-1 text-[clamp(2.25rem,7vw,6.5rem)] leading-[0.95] font-semibold tracking-tighter">
            {track.name}
          </span>
          {/* "+" turns into "x" when open */}
          <span
            aria-hidden="true"
            className={`font-mono text-3xl text-white/50 transition-transform duration-500 sm:text-4xl ${open ? 'rotate-45' : ''}`}
          >
            +
          </span>
        </button>
      </h3>

      {/* Height animates 0 -> auto via grid rows 0fr -> 1fr. When it settles,
          re-measure ScrollTrigger: the page got taller or shorter, which
          moves the reveal trigger points of every section below. */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
        onTransitionEnd={(e) => {
          if (e.propertyName === 'grid-template-rows') ScrollTrigger.refresh()
        }}
      >
        <div className="overflow-hidden" inert={!open}>
          <div
            className={`grid gap-6 pb-10 transition-[opacity,transform] duration-700 sm:pl-[5.5rem] md:grid-cols-2 md:gap-12 md:pb-14 ${
              open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {track.description.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="max-w-xl text-lg leading-relaxed text-white/75">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
