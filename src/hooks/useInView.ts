import { useEffect, useState, type RefObject } from 'react'

/**
 * True once the element has scrolled into view (and stays true).
 * `rootMargin` shrinks the trigger zone: '-12% 0px' means it must be 12% of
 * the screen height inside the viewport before it counts.
 */
export function useInView(ref: RefObject<Element | null>, rootMargin = '-12% 0px') {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, rootMargin, inView])

  return inView
}
