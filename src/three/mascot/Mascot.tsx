import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { scrollState } from '../../scroll/scrollState'
import { pointerState } from '../pointerState'
import { mascotFx } from './mascotFx'
import { buildMascot, EYE_CENTER_Y, GRID_COLS, GRID_ROWS, HAT_BASE_Y } from './voxels'
import { VoxelPart } from './VoxelPart'

/** Resting pose: turned slightly so its depth shows. */
const REST_YAW = -0.35
/** How far it turns toward the cursor (radians at the screen edge). */
const LOOK_YAW = 0.55
const LOOK_PITCH = 0.25
/** How far the eyes slide across the face (grid cells). */
const EYE_TRAVEL = 1.1
/** Hat tip pose when hovered: lift (cells), tilt sideways and back (radians). */
const HAT_LIFT = 3.5
const HAT_TILT = 0.38
const HAT_BACK = -0.3
/** Scroll speed (Lenis px/frame) that counts as a full-speed flick. */
const FAST_SCROLL = 40
/** Below this share of full speed, scrolling doesn't burst the mascot. */
const BURST_THRESHOLD = 0.25

/**
 * The Frontera Devs mascot as a glossy 3D voxel figure, built cube-for-pixel
 * from the real pixel-art logo.
 *
 * Layout: on wide screens it stands on the right, clear of the bottom-left
 * headline; on portrait phones it sits centred in the upper half.
 *
 * Behaviour: turns to face the cursor, eyes follow it, blinks every few
 * seconds, tips its hat when hovered (or tapped); idles with a gentle bob
 * and sway when there's no cursor. Rises with parallax as you scroll, and
 * bursts into flying cubes on a fast scroll, reassembling as it slows.
 */
export function Mascot() {
  const parts = useMemo(() => buildMascot(), [])
  const viewport = useThree((s) => s.viewport)
  const reduceMotion = usePrefersReducedMotion()

  const body = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
  const hat = useRef<THREE.Group>(null)
  const root = useRef<THREE.Group>(null)
  const scrollSpeed = useRef(0)
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
    const h = hat.current
    const r = root.current
    if (!b || !e || !h || !r) return
    const t = state.clock.elapsedTime
    const looking = pointerState.active

    // --- Scroll ---
    // Parallax: rise at ~half the page's speed as you scroll past the hero.
    // window.scrollY works with or without Lenis (reduced motion).
    const rootY = y + (window.scrollY / window.innerHeight) * viewport.height * 0.55
    r.position.y = rootY

    // Burst: smoothed scroll speed -> 0..1, ignoring gentle scrolling.
    const raw = THREE.MathUtils.clamp(scrollState.velocity / FAST_SCROLL, -1, 1)
    scrollSpeed.current = THREE.MathUtils.damp(scrollSpeed.current, raw, 6, delta)
    const amount = Math.abs(scrollSpeed.current)
    mascotFx.burst = reduceMotion ? 0 : THREE.MathUtils.smoothstep(amount, BURST_THRESHOLD, 1)
    mascotFx.direction = scrollSpeed.current

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

    // --- Hat tip when the cursor is over the mascot ---
    // Cursor in world units, compared with the figure's on-screen box.
    const cursorX = pointerState.x * (viewport.width / 2)
    const cursorY = pointerState.y * (viewport.height / 2)
    const hovering =
      looking &&
      Math.abs(cursorX - x) < (GRID_COLS * unit) / 2 &&
      Math.abs(cursorY - rootY) < (GRID_ROWS * unit) / 2 &&
      mascotFx.burst < 0.1 // no hat tip mid-explosion
    const tip = hovering ? 1 : 0
    // A slightly slower "settle" than "lift" so it feels like a polite gesture.
    const speed = hovering ? 7 : 4
    h.position.y = THREE.MathUtils.damp(h.position.y, HAT_BASE_Y + tip * HAT_LIFT, speed, delta)
    h.rotation.z = THREE.MathUtils.damp(h.rotation.z, tip * HAT_TILT, speed, delta)
    h.rotation.x = THREE.MathUtils.damp(h.rotation.x, tip * HAT_BACK, speed, delta)

    // --- Blink: squash the eyes flat for ~0.12s every 2.5-6s ---
    if (!reduceMotion && t > nextBlink.current) {
      const blinking = t < nextBlink.current + 0.12
      e.scale.y = blinking ? 0.15 : 1
      if (!blinking) nextBlink.current = t + 2.5 + Math.random() * 3.5
    }
  })

  return (
    <group ref={root} position={[x, y, 0]} scale={unit}>
      <group ref={body} rotation={[0, REST_YAW, 0]}>
        <VoxelPart voxels={parts.body} />
        {/* Hat pivots around its brim so the tip looks natural */}
        <group ref={hat} position={[0, HAT_BASE_Y, 0]}>
          <group position={[0, -HAT_BASE_Y, 0]}>
            <VoxelPart voxels={parts.hat} />
          </group>
        </group>
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
