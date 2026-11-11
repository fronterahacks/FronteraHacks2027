/**
 * Per-frame effect values shared between <Mascot> (which computes them)
 * and each <VoxelPart> (which applies them to its cubes). A plain mutable
 * object, like scrollState, so updating it never re-renders React.
 */
export const mascotFx = {
  /** 0 = assembled, 1 = fully burst apart (driven by fast scrolling). */
  burst: 0,
  /** Signed scroll direction, -1..1: + down, - up. Cubes trail opposite it. */
  direction: 0,
}
