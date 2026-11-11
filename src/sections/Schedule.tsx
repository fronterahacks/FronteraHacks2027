import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Fragment, useRef } from 'react'
import { RevealText } from '../components/RevealText'
import { SectionHeading } from '../components/SectionHeading'
import { schedule } from '../data/event'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/** Rows "light up" as their top passes this line (share of screen height). */
export const LIT_LINE = 0.55

/**
 * Schedule as one continuous timeline through both days (no tabs, so the
 * neon tube in the 3D scene can run through the whole 24 hours).
 *
 * Each row has a node dot in the left column; the 3D tube passes through
 * those dots (positions are measured from the DOM). As a row's top crosses
 * LIT_LINE it lights up: brighter text, pink time, filled dot. Scrolling
 * back up dims it again.
 */
export function Schedule({ index }: { index: number }) {
  const list = useRef<HTMLOListElement>(null)

  // Set data-lit on each row as it crosses the lit line.
  useGSAP(
    () => {
      const rows = list.current?.querySelectorAll<HTMLElement>('[data-row]') ?? []
      rows.forEach((row) => {
        ScrollTrigger.create({
          trigger: row,
          start: `top ${LIT_LINE * 100}%`,
          // Light when its top passes the line going down; dim only when you
          // scroll back up above it (it stays lit after scrolling past).
          onEnter: () => {
            row.dataset.lit = 'true'
          },
          onLeaveBack: () => {
            row.dataset.lit = 'false'
          },
        })
      })
    },
    { scope: list },
  )

  return (
    <section id="schedule" className="scroll-mt-20 px-5 py-28 sm:px-8 md:px-12 md:py-40">
      <SectionHeading index={index} label="Schedule" title={schedule.title} />

      <RevealText
        as="p"
        variant="paragraph"
        className="mt-10 max-w-2xl text-xl text-white/75 sm:text-2xl md:mt-14"
      >
        {schedule.intro}
      </RevealText>

      <ol ref={list} className="mt-20 md:mt-28">
        {schedule.days.map((day) => (
          <Fragment key={day.label}>
            {/* Day marker */}
            <li data-row data-node="day" data-lit="false" className="group/row grid grid-cols-[2.5rem_1fr] items-center gap-4 pt-10 pb-6 first:pt-0 sm:grid-cols-[3.5rem_1fr] sm:gap-8">
              <span className="flex justify-center">
                <span
                  data-node-dot
                  className="size-4 rounded-full border-2 border-fh-purple/60 transition-all duration-500 group-data-[lit=true]/row:border-fh-pink group-data-[lit=true]/row:bg-fh-pink group-data-[lit=true]/row:shadow-[0_0_16px_#ff00c8]"
                />
              </span>
              <h3 className="text-3xl font-semibold tracking-tighter text-white/40 transition-colors duration-500 group-data-[lit=true]/row:text-white sm:text-5xl">
                {day.heading}
              </h3>
            </li>

            {/* Events */}
            {day.items.map((item) => (
              <li
                key={`${day.label}-${item.time}`}
                data-row
                data-node="event"
                data-lit="false"
                className="group/row grid grid-cols-[2.5rem_1fr] items-baseline gap-4 border-t border-white/5 py-5 sm:grid-cols-[3.5rem_1fr] sm:gap-8 md:py-6"
              >
                <span className="flex justify-center self-center">
                  <span
                    data-node-dot
                    className="size-2 rounded-full bg-white/20 transition-all duration-500 group-data-[lit=true]/row:bg-fh-pink group-data-[lit=true]/row:shadow-[0_0_10px_#ff00c8]"
                  />
                </span>
                <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-8 md:grid-cols-[11rem_1fr]">
                  <time className="font-mono text-sm tracking-[0.15em] text-white/35 uppercase transition-colors duration-500 group-data-[lit=true]/row:text-fh-pink sm:text-base">
                    {item.time}
                  </time>
                  <span className="text-xl text-white/45 transition-colors duration-500 group-data-[lit=true]/row:text-white sm:text-2xl md:text-3xl">
                    {item.event}
                  </span>
                </div>
              </li>
            ))}
          </Fragment>
        ))}
      </ol>
    </section>
  )
}
