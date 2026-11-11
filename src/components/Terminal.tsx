import type { ReactNode } from 'react'

/**
 * The old site's terminal title bar: three dots + "// TITLE.exe".
 * Used on its own above section headings, or as the header of a
 * <TerminalWindow>.
 */
export function TerminalBar({ title, className = '' }: { title: string; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span aria-hidden="true" className="size-2.5 rounded-full bg-fh-purple/50" />
      <span aria-hidden="true" className="size-2.5 rounded-full bg-fh-purple/50" />
      <span aria-hidden="true" className="size-2.5 rounded-full bg-fh-purple/50" />
      <span className="ml-2 font-mono text-xs tracking-[0.15em] text-fh-purple/80">{title}</span>
    </div>
  )
}

/**
 * A terminal-style window: dark glassy panel with a neon border and glow,
 * a title bar on top, and any content inside.
 */
export function TerminalWindow({
  title,
  children,
  className = '',
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-fh-purple/40 bg-[rgb(2_2_12/0.75)] shadow-[0_0_40px_rgb(180_0_255/0.2),inset_0_0_40px_rgb(180_0_255/0.03)] backdrop-blur-md ${className}`}
    >
      <TerminalBar
        title={title}
        className="border-b border-fh-border bg-fh-purple/8 px-4 py-2.5"
      />
      {children}
    </div>
  )
}
