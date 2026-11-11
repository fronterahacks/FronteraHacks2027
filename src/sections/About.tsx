import { useState } from 'react'
import { GlitchText } from '../components/GlitchText'
import { Reveal } from '../components/Reveal'
import { RevealText } from '../components/RevealText'
import { SectionHeading } from '../components/SectionHeading'
import { about, type Pillar } from '../data/event'

/**
 * About: numbered heading, then an editorial two-column layout on large
 * screens: quick facts on the left, the description set large on the right
 * (its words light up as you scroll). Below that, the Connect / Grow /
 * Build pillars as minimal numbered cards that stagger in.
 */
export function About({ index }: { index: number }) {
  return (
    <section id="about" className="scroll-mt-20 px-5 py-28 sm:px-8 md:px-12 md:py-40">
      <SectionHeading index={index} label="About" title={about.title} />

      <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-12 lg:gap-16">
        {/* Quick facts */}
        <Reveal stagger={0.08} className="grid grid-cols-2 gap-x-6 gap-y-8 self-start lg:col-span-4 lg:grid-cols-1">
          {about.facts.map((fact) => (
            <div key={fact.label} className="border-t border-white/10 pt-4">
              <p className="font-mono text-xs tracking-[0.2em] text-white/50 uppercase sm:text-sm">
                {fact.label}
              </p>
              <p className="mt-2 text-xl font-medium text-white sm:text-2xl">{fact.value}</p>
            </div>
          ))}
        </Reveal>

        {/* Description: words light up in reading order as you scroll */}
        <RevealText
          as="p"
          variant="paragraph"
          className="text-2xl leading-snug font-medium tracking-tight text-white sm:text-3xl lg:col-span-8 lg:text-[2.6rem] lg:leading-[1.2]"
        >
          {about.description}
        </RevealText>
      </div>

      {/* Pillars: Connect / Grow / Build */}
      <div className="mt-28 md:mt-40">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.25em] text-white/70 uppercase sm:text-sm">
            <span className="text-fh-purple">// </span>
            {about.pillarsLabel}
          </p>
        </Reveal>

        <Reveal stagger={0.12} className="mt-10 grid gap-14 md:grid-cols-3 md:gap-8 lg:gap-12">
          {about.pillars.map((pillar, i) => (
            <PillarCard key={pillar.title} pillar={pillar} index={i + 1} />
          ))}
        </Reveal>
      </div>
    </section>
  )
}

/**
 * One pillar. On hover or keyboard focus: the photo zooms with a neon ring,
 * the number turns pink, a gradient line draws across the top edge, and the
 * title glitch-decodes.
 */
function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
  const [replay, setReplay] = useState(0)
  const glitch = () => setReplay((n) => n + 1)

  return (
    <article
      tabIndex={0}
      onMouseEnter={glitch}
      onFocus={glitch}
      className="group relative border-t border-white/10 pt-6 outline-none focus-visible:ring-2 focus-visible:ring-fh-purple/60 focus-visible:ring-offset-8 focus-visible:ring-offset-fh-bg"
    >
      {/* Gradient line that draws over the hairline on hover */}
      <span
        aria-hidden="true"
        className="absolute -top-px left-0 h-px w-0 bg-linear-to-r from-fh-purple via-fh-pink to-transparent transition-[width] duration-700 ease-out group-hover:w-full group-focus-visible:w-full"
      />
      <div className="flex items-start justify-between">
        <span className="font-mono text-sm tracking-[0.2em] text-fh-purple transition-colors duration-300 group-hover:text-fh-pink">
          {String(index).padStart(2, '0')}
        </span>
        <img
          src={pillar.image}
          alt=""
          width={176}
          height={176}
          loading="lazy"
          className="size-24 rounded-full object-cover ring-1 ring-white/15 transition-[transform,box-shadow] duration-500 ease-out group-hover:scale-110 group-hover:shadow-[0_0_0_2px_#b400ff,0_0_32px_rgb(180_0_255/0.6)] sm:size-28"
        />
      </div>
      <h3 className="mt-8 text-5xl font-semibold tracking-tighter sm:text-6xl">
        <GlitchText text={pillar.title} replay={replay} stepMs={45} />
      </h3>
      <p className="mt-4 max-w-sm text-lg text-white/70">{pillar.description}</p>
    </article>
  )
}
