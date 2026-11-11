/**
 * Per-frame effect values shared between a <Mascot> (which computes them)
 * and its <VoxelPart>s (which apply them to the cubes). Each Mascot owns its
 * own MascotFx (passed down as a ref), so more than one mascot can exist,
 * e.g. the hero one and the footer finale one. Plain mutable data, so
 * updating it never re-renders React.
 */
export type MascotFx = {
  /** 0 = assembled, 1 = fully scattered. */
  burst: number
  /** Signed scroll direction, -1..1: + down, - up. Cubes trail opposite it. */
  direction: number
  /** 0 = visible, 1 = gone: scattered cubes shrink away to nothing. */
  fade: number
}

export const createMascotFx = (): MascotFx => ({ burst: 0, direction: 0, fade: 0 })
