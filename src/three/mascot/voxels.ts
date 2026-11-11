import { MASCOT_GRID, MASCOT_PALETTE } from './mascotVoxels'

/** One cube of the mascot, in grid units (1 = one art pixel). */
export type Voxel = {
  /** Column, centred: 0 is the middle of the sprite. */
  x: number
  /** Row, centred and flipped so +y is up. */
  y: number
  /** Front-to-back position of the cube's centre. */
  z: number
  /** Front-to-back thickness. */
  depth: number
  color: string
}

export const GRID_COLS = MASCOT_GRID[0].length
export const GRID_ROWS = MASCOT_GRID.length

// Regions of the sprite, in grid rows/cols (see the ASCII art in
// mascotVoxels.ts). If the mascot art changes, check these still match.
const HAT_LAST_ROW = 13 // rows 0..13: cowboy hat (incl. the outline under the brim)
const FACE = { top: 18, bottom: 29, left: 13, right: 28 } // the screen on the head
const EYE_ROWS = [22, 23] // dark cells on these face rows are the eyes
const HAND = { firstRow: 26, lastCol: 10 } // peace-sign hand, lower left
const LEGS_FIRST_ROW = 41

/** Thickness (front-to-back) of each part, in grid units. */
const DEPTH = { hat: 9, head: 7, hand: 3, body: 5, legs: 3 }

export type MascotParts = {
  body: Voxel[]
  hat: Voxel[]
  eyes: Voxel[]
}

/** Splits the sprite into parts and gives every pixel a 3D cube. */
export function buildMascot(): MascotParts {
  const parts: MascotParts = { body: [], hat: [], eyes: [] }

  MASCOT_GRID.forEach((line, row) => {
    for (let col = 0; col < line.length; col++) {
      const key = line[col]
      if (key === '.') continue
      const color = MASCOT_PALETTE[key].color
      const x = col - (GRID_COLS - 1) / 2
      const y = (GRID_ROWS - 1) / 2 - row

      const inFace = row >= FACE.top && row <= FACE.bottom && col >= FACE.left && col <= FACE.right
      const isEye = inFace && EYE_ROWS.includes(row) && MASCOT_PALETTE[key].name === 'outline'
      const isHand = row >= HAND.firstRow && col <= HAND.lastCol && row < LEGS_FIRST_ROW

      if (row <= HAT_LAST_ROW) {
        parts.hat.push({ x, y, z: 0, depth: DEPTH.hat, color })
      } else if (isEye) {
        // Eyes sit just proud of the face so they can slide around on it,
        // and the face behind them is filled in with screen colour.
        parts.eyes.push({ x, y, z: DEPTH.head / 2, depth: 0.6, color })
        parts.body.push({ x, y, z: 0, depth: DEPTH.head, color: MASCOT_PALETTE.b.color })
      } else if (isHand) {
        // The peace sign pokes forward, toward the viewer.
        parts.body.push({ x, y, z: DEPTH.head / 2, depth: DEPTH.hand, color })
      } else if (row >= LEGS_FIRST_ROW) {
        parts.body.push({ x, y, z: 0, depth: DEPTH.legs, color })
      } else if (row <= FACE.bottom + 2) {
        parts.body.push({ x, y, z: 0, depth: DEPTH.head, color })
      } else {
        parts.body.push({ x, y, z: 0, depth: DEPTH.body, color })
      }
    }
  })

  return parts
}
