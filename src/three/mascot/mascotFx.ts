/**
 * Per-frame effect values shared between <Mascot> (which computes them)
 * and each <VoxelPart> (which applies them to its cubes). A plain mutable
 * object, like scrollState, so updating it never re-renders React.
 */
export const mascotFx = {
  /** 0 = assembled, 1 = fully scattered (by scroll position, plus a kick from fast flicks). */
  burst: 0,
  /** Signed scroll direction, -1..1: + down, - up. Cubes trail opposite it. */
  direction: 0,
  /** 0 = visible, 1 = gone: scattered cubes shrink away once you've
   *  scrolled past the hero panel, so later sections get a clean backdrop. */
  fade: 0,
}
