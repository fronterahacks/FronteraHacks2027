import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import { buildMascot, GRID_COLS, GRID_ROWS } from './voxels'
import { VoxelPart } from './VoxelPart'

/**
 * The Frontera Devs mascot as a glossy 3D voxel figure, built cube-for-pixel
 * from the real pixel-art logo.
 *
 * Layout: on wide screens it stands on the right, clear of the bottom-left
 * headline; on portrait phones it sits centred in the upper half.
 */
export function Mascot() {
  const parts = useMemo(() => buildMascot(), [])
  const viewport = useThree((s) => s.viewport)

  const portrait = viewport.aspect < 1
  // World units per grid cell: fit the figure to a share of the screen.
  const unit = portrait
    ? Math.min((viewport.height * 0.42) / GRID_ROWS, (viewport.width * 0.75) / GRID_COLS)
    : Math.min((viewport.height * 0.78) / GRID_ROWS, (viewport.width * 0.42) / GRID_COLS)
  const x = portrait ? 0 : viewport.width * 0.22
  const y = portrait ? viewport.height * 0.2 : viewport.height * 0.04

  return (
    <group position={[x, y, 0]} scale={unit} rotation={[0, -0.35, 0]}>
      <VoxelPart voxels={parts.body} />
      <VoxelPart voxels={parts.hat} />
      <VoxelPart voxels={parts.eyes} />
    </group>
  )
}
