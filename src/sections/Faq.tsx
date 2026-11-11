import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useId, useState } from 'react'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { event, faq, type FaqItem } from '../data/event'

/**
 * FAQ: numbered heading, then each question as an expanding row (one open
 * at a time, same pattern as Tracks but sized for reading), and a
 * "Still have questions?" contact line.
 */
export function Faq({ index }: { index: number }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="scroll-mt-20 px-5 py-28 sm:px-8 md:px-12 md:py-40">
      <SectionHeading index={index} label="FAQ" title={faq.title} />

      <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-12">
        <Reveal stagger={0.06} className="border-b border-white/10 lg:col-span-9 lg:col-start-4">
          {faq.items.map((item, i) => (
            <FaqRow
              key={item.question}
              item={item}
              number={i + 1}
              open={open === i}
              onToggle={() => setOpen((current) => (current === i ? null : i))}
            />
          ))}
        </Reveal>

        {/* Contact */}
        <Reveal className="lg:col-span-3 lg:col-start-1 lg:row-start-1">
          <p className="text-2xl font-semibold tracking-tight">{faq.moreTitle}</p>
          <p className="mt-2 text-white/60">{faq.moreText}</p>
          <a
            href={`mailto:${event.contactEmail}`}
            className="mt-4 inline-block border-b border-fh-purple/60 pb-0.5 font-mono text-sm tracking-wide text-fh-lilac transition-colors hover:border-fh-pink hover:text-white"
          >
            {event.contactEmail}
          </a>
        </Reveal>
      </div>
    </section>
  )
}

function FaqRow({
  item,
  number,
  open,
  onToggle,
}: {
  item: FaqItem
  number: number
  open: boolean
  onToggle: () => void
}) {
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
          className="group relative flex w-full items-center gap-5 py-6 text-left outline-none sm:gap-8 md:py-7"
        >
          {/* Same glass hover highlight as the track rows */}
          <span
            aria-hidden="true"
            className="absolute inset-y-1 -right-3 -left-3 origin-left scale-x-0 rounded-2xl border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100 sm:-right-5 sm:-left-5"
          />
          <span className="relative w-8 shrink-0 font-mono text-sm tracking-[0.2em] text-fh-purple transition-colors duration-300 group-hover:text-fh-pink sm:w-10">
            {String(number).padStart(2, '0')}
          </span>
          <span
            className={`relative flex-1 text-xl font-medium tracking-tight transition-colors duration-300 sm:text-2xl md:text-3xl ${
              open ? 'text-white' : 'text-white/85 group-hover:text-white'
            }`}
          >
            {item.question}
          </span>
          <span
            aria-hidden="true"
            className={`relative font-mono text-2xl text-white/50 transition-[transform,color] duration-500 group-hover:text-white sm:text-3xl ${open ? 'rotate-45' : ''}`}
          >
            +
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
        onTransitionEnd={(e) => {
          // Page height changed: re-measure scroll animations below.
          if (e.propertyName === 'grid-template-rows') ScrollTrigger.refresh()
        }}
      >
        <div className="overflow-hidden" inert={!open}>
          <p
            className={`max-w-2xl pb-8 text-lg leading-relaxed text-white/70 transition-[opacity,transform] duration-700 sm:pl-[4.5rem] md:pb-10 ${
              open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            }`}
          >
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  )
}
