/**
 * Shared between the Schedule section (which measures its DOM) and the 3D
 * neon timeline (which draws a tube through the measured points). A plain
 * mutable object, like scrollState, so updates never re-render React.
 *
 * All positions are in PAGE pixels: x from the left edge of the window, y
 * from the top of the whole document (not the screen), so they don't change
 * while scrolling, only when the layout changes.
 */
export type TimelineNode = {
  /** Centre of the node dot. */
  x: number
  y: number
  kind: 'day' | 'event'
}

export const timelineState = {
  nodes: [] as TimelineNode[],
  /** Top and bottom of the Schedule section, in page pixels. */
  sectionTop: 0,
  sectionBottom: 0,
  /** Window size at measurement time (the 3D side converts with these). */
  width: 1,
  height: 1,
  /** Bumped on every re-measure, so the 3D side knows to rebuild the tube. */
  version: 0,
}

/** Rows light up as their top crosses this line (share of screen height),
 *  and the 3D pulse travels along the same line, so they stay in sync. */
export const LIT_LINE = 0.55
