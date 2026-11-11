import { useEffect, useState } from 'react'
import mascot from '../assets/brand/frontera-devs-mascot.png'
import { event, navLinks } from '../data/event'

/**
 * Fixed top navigation, styled after the placeholder site's "cyber-nav":
 * glassy dark bar, purple bottom border, glowing mascot, monospace links
 * with a gradient underline that grows on hover.
 *
 * Below the md breakpoint (768px) the links collapse into a menu button,
 * which the old site didn't have (its links overflowed on phones).
 */
export function Nav() {
  const [open, setOpen] = useState(false)

  // Close the mobile menu with the Escape key.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-fh-purple/25 bg-fh-panel backdrop-blur-lg">
      {/* Three columns: [logo | links | spacer]. The two outer columns are
          equal width (1fr each), which keeps the links exactly centred in
          the bar no matter how wide the logo is. Full width (no max-w) so
          the logo sits at the bar's left edge. */}
      <nav
        aria-label="Main"
        className="grid h-16 grid-cols-[1fr_auto_1fr] items-center px-4 md:h-20 md:px-6"
      >
        <a href="#top" className="justify-self-start" aria-label={`${event.name} home`}>
          <img
            src={mascot}
            alt=""
            width={60}
            height={60}
            className="h-11 w-auto [image-rendering:pixelated] drop-shadow-[0_0_6px_rgb(180_0_255/0.4)] md:h-14"
          />
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-10 md:flex lg:gap-12">
          {navLinks.map((link) => (
            <li key={link.href}>
              <NavItem href={link.href} label={link.label} />
            </li>
          ))}
        </ul>

        {/* Mobile menu button (right column). On desktop this column stays
            empty and just balances the logo column. */}
        <button
          type="button"
          className="col-start-3 justify-self-end font-mono text-sm tracking-[0.15em] text-white/80 uppercase hover:text-white md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? '[ close ]' : '[ menu ]'}
        </button>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <ul
          id="mobile-menu"
          className="flex flex-col gap-1 border-t border-fh-border px-4 pt-2 pb-4 md:hidden"
        >
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-3 font-mono text-base tracking-[0.15em] text-white/80 uppercase hover:text-white"
              >
                <span className="text-fh-purple">&gt; </span>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}

/** Desktop nav link with the old site's growing gradient underline. */
function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="group relative font-mono text-base tracking-[0.15em] text-white/70 uppercase transition-colors hover:text-white focus-visible:text-white"
    >
      {label}
      <span
        aria-hidden="true"
        className="absolute -bottom-1 left-0 h-px w-0 bg-linear-to-r from-fh-purple to-fh-violet transition-[width] duration-300 group-hover:w-full group-focus-visible:w-full"
      />
    </a>
  )
}
