import { Reveal } from '../components/Reveal'
import { RevealText } from '../components/RevealText'
import { SectionHeading } from '../components/SectionHeading'
import { about } from '../data/event'

/**
 * About: numbered heading, then an editorial two-column layout on large
 * screens: quick facts on the left, the description set large on the right
 * (its words light up as you scroll).
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
    </section>
  )
}
