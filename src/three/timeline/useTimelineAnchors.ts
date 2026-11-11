import { useEffect, type RefObject } from 'react'
import { timelineState, type TimelineNode } from './timelineState'

/**
 * Measures where every node dot inside `listRef` sits on the page and stores
 * it in timelineState for the 3D tube. Re-measures whenever the page's size
 * changes: window resizes, a Tracks row expanding above, fonts loading, etc.
 * (one ResizeObserver on <body> catches all of those).
 */
export function useTimelineAnchors(
  sectionRef: RefObject<HTMLElement | null>,
  listRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    let frame = 0

    const measure = () => {
      const section = sectionRef.current
      const list = listRef.current
      if (!section || !list) return
      const scrollY = window.scrollY

      const nodes: TimelineNode[] = []
      list.querySelectorAll<HTMLElement>('[data-row]').forEach((row) => {
        const dot = row.querySelector<HTMLElement>('[data-node-dot]')
        if (!dot) return
        const r = dot.getBoundingClientRect()
        nodes.push({
          x: r.left + r.width / 2,
          y: r.top + r.height / 2 + scrollY,
          kind: row.dataset.node === 'day' ? 'day' : 'event',
        })
      })

      const s = section.getBoundingClientRect()
      timelineState.nodes = nodes
      timelineState.sectionTop = s.top + scrollY
      timelineState.sectionBottom = s.bottom + scrollY
      timelineState.width = window.innerWidth
      timelineState.height = window.innerHeight
      timelineState.version++
    }

    // Batch bursts of resize events into one measurement per frame.
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    schedule()
    const observer = new ResizeObserver(schedule)
    observer.observe(document.body)
    window.addEventListener('resize', schedule)
    document.fonts?.ready.then(schedule)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', schedule)
    }
  }, [sectionRef, listRef])
}
