import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { pointerState } from '../pointerState'
import { buildMascot, EYE_CENTER_Y, GRID_COLS, GRID_ROWS } from './voxels'
import { VoxelPart } from './VoxelPart'

/** Resting pose: turned slightly so its depth shows. */
const REST_YAW = -0.35
/** How far it turns toward the cursor (radians at the screen edge). */
const LOOK_YAW = 0.55
const LOOK_PITCH = 0.25
/** How far the eyes slide across the face (grid cells). */
const EYE_TRAVEL = 1.1

/**
 * The Frontera Devs mascot as a glossy 3D voxel figure, built cube-for-pixel
 * from the real pixel-art logo.
 *
 * Layout: on wide screens it stands on the right, clear of the bottom-left
 * headline; on portrait phones it sits centred in the upper half.
 *
 * Behaviour: turns to face the cursor, eyes follow it, blinks every few
 * seconds; idles with a gentle bob and sway when there's no cursor.
 */
export function Mascot() {
  const parts = useMemo(() => buildMascot(), [])
  const viewport = useThree((s) => s.viewport)
  const reduceMotion = usePrefersReducedMotion()

  const body = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
  const nextBlink = useRef(2)

  const portrait = viewport.aspect < 1
  // World units per grid cell: fit the figure to a share of the screen.
  const unit = portrait
    ? Math.min((viewport.height * 0.42) / GRID_ROWS, (viewport.width * 0.75) / GRID_COLS)
    : Math.min((viewport.height * 0.78) / GRID_ROWS, (viewport.width * 0.42) / GRID_COLS)
  const x = portrait ? 0 : viewport.width * 0.22
  const y = portrait ? viewport.height * 0.2 : viewport.height * 0.04

  useFrame((state, delta) => {
    const b = body.current
    const e = eyes.current
    if (!b || !e) return
    const t = state.clock.elapsedTime
    const looking = pointerState.active

    // --- Turn toward the cursor (or idle sway) ---
    const idleSway = reduceMotion ? 0 : Math.sin(t * 0.5) * 0.12
    const yaw = looking ? REST_YAW + pointerState.x * LOOK_YAW : REST_YAW + idleSway
    const pitch = looking ? -pointerState.y * LOOK_PITCH : 0
    b.rotation.y = THREE.MathUtils.damp(b.rotation.y, yaw, 4, delta)
    b.rotation.x = THREE.MathUtils.damp(b.rotation.x, pitch, 4, delta)

    // Gentle hover bob (grid units, since we're inside the scaled group).
    b.position.y = reduceMotion ? 0 : Math.sin(t * 1.1) * 0.6

    // --- Eyes follow the cursor across the face ---
    const ex = looking ? THREE.MathUtils.clamp(pointerState.x * 1.4, -1, 1) * EYE_TRAVEL : 0
    const ey = looking ? THREE.MathUtils.clamp(pointerState.y * 1.4, -1, 1) * EYE_TRAVEL * 0.7 : 0
    e.position.x = THREE.MathUtils.damp(e.position.x, ex, 10, delta)
    e.position.y = THREE.MathUtils.damp(e.position.y, ey, 10, delta)

    // --- Blink: squash the eyes flat for ~0.12s every 2.5-6s ---
    if (!reduceMotion && t > nextBlink.current) {
      const blinking = t < nextBlink.current + 0.12
      e.scale.y = blinking ? 0.15 : 1
      if (!blinking) nextBlink.current = t + 2.5 + Math.random() * 3.5
    }
  })

  return (
    <group position={[x, y, 0]} scale={unit}>
      <group ref={body} rotation={[0, REST_YAW, 0]}>
        <VoxelPart voxels={parts.body} />
        <VoxelPart voxels={parts.hat} />
        {/* Eyes pivot around their own centre so blinking squashes in place */}
        <group position={[0, EYE_CENTER_Y, 0]}>
          <group ref={eyes}>
            <group position={[0, -EYE_CENTER_Y, 0]}>
              <VoxelPart voxels={parts.eyes} />
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
