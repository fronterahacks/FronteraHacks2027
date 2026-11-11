import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { scrollState } from '../../scroll/scrollState'
import { pointerState } from '../pointerState'
import { easeOut, finaleProgress } from '../finale/finaleProgress'
import { createMascotFx } from './mascotFx'
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
/** Scatter by scroll position, in screen-heights scrolled. The glass panel
 *  (info + countdown) starts one screen down, so: stay whole while the
 *  first screen is in view, come apart as the panel slides up, and be fully
 *  scattered (behind the glass) once the countdown is on screen. */
const SCATTER_START = 0.3
const SCATTER_END = 0.9
/** Scroll speed (Lenis px/frame) that counts as a full-speed flick. */
const FAST_SCROLL = 40
/** Extra scatter a fast flick adds on top of the position-based scatter. */
const FLICK_BOOST = 0.3
/** How fast the mascot rises relative to the page (parallax). */
const PARALLAX = 0.35
/** The cubes fade out as the hero's bottom edge (end of the glass panel)
 *  moves from this share of the screen height up to the top. */
const FADE_ZONE = 0.7
/** Finale: share of finale progress over which cubes arrive (grow in) and
 *  then fly together; the last part lines up with the horizon pulse. */
const FINALE_ARRIVE = [0.12, 0.4] as const
const FINALE_ASSEMBLE = [0.35, 0.9] as const
/** Finale: tips its hat for this long, every this many seconds, once whole. */
const GOODBYE_EVERY = 4
const GOODBYE_FOR = 1.3

type Placement = 'hero' | 'finale'

/**
 * The Frontera Devs mascot as a glossy 3D voxel figure, built cube-for-pixel
 * from the real pixel-art logo.
 *
 * Layout: on wide screens it stands on the right, clear of the bottom-left
 * headline; on portrait phones it sits centred in the upper half.
 *
 * Behaviour: turns to face the cursor, eyes follow it, blinks every few
 * seconds, tips its hat when hovered (or tapped); idles with a gentle bob
 * and sway when there's no cursor. As you scroll away from the hero it
 * scatters into drifting cubes (by scroll position, so it stays scattered),
 * reassembling only when you scroll back up to it. Past the hero panel the
 * cubes shrink away so the sections below get a clean background.
 *
 * placement="finale": a second mascot for the footer's frontier finale. It
 * stands on the horizon to the right of the sign-off text, flies together
 * from scattered cubes as the footer arrives, then tips its hat goodbye every
 * few seconds (cursor-follow, blinking and hover tip still work).
 */
export function Mascot({ placement = 'hero' }: { placement?: Placement }) {
  const finale = placement === 'finale'
  const parts = useMemo(() => buildMascot(), [])
  const viewport = useThree((s) => s.viewport)
  const reduceMotion = usePrefersReducedMotion()

  const body = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
  const hat = useRef<THREE.Group>(null)
  const root = useRef<THREE.Group>(null)
  const scrollSpeed = useRef(0)
  // This mascot's own effect values, read by its VoxelParts each frame.
  const fx = useRef(createMascotFx())
  const nextBlink = useRef(2)

  const portrait = viewport.aspect < 1
  // World units per grid cell: fit the figure to a share of the screen.
  const heroUnit = portrait
    ? Math.min((viewport.height * 0.42) / GRID_ROWS, (viewport.width * 0.75) / GRID_COLS)
    : Math.min((viewport.height * 0.78) / GRID_ROWS, (viewport.width * 0.42) / GRID_COLS)
  const finaleUnit = portrait
    ? Math.min((viewport.height * 0.2) / GRID_ROWS, (viewport.width * 0.4) / GRID_COLS)
    : Math.min((viewport.height * 0.3) / GRID_ROWS, (viewport.width * 0.25) / GRID_COLS)
  const unit = finale ? finaleUnit : heroUnit
  // Finale: feet on the horizon (~69% down the screen), right of the text.
  const finaleFeetY = viewport.height / 2 - viewport.height * 0.69
  const x = finale ? viewport.width * (portrait ? 0.28 : 0.32) : portrait ? 0 : viewport.width * 0.22
  const y = finale
    ? finaleFeetY + (GRID_ROWS * unit) / 2
    : portrait
      ? viewport.height * 0.2
      : viewport.height * 0.04

  useFrame((state, delta) => {
    const b = body.current
    const e = eyes.current
    const h = hat.current
    const r = root.current
    if (!b || !e || !h || !r) return
    const t = state.clock.elapsedTime
    const looking = pointerState.active

    // Scroll speed, smoothed (used for flick kicks and cube trails).
    const raw = THREE.MathUtils.clamp(scrollState.velocity / FAST_SCROLL, -1, 1)
    scrollSpeed.current = THREE.MathUtils.damp(scrollSpeed.current, raw, 6, delta)
    fx.current.direction = scrollSpeed.current

    let rootY: number
    if (finale) {
      // --- Finale: arrive and fly together as the footer scrolls in ---
      const p = finaleProgress()
      const arrive = THREE.MathUtils.smoothstep(p, FINALE_ARRIVE[0], FINALE_ARRIVE[1])
      const assemble = THREE.MathUtils.smoothstep(p, FINALE_ASSEMBLE[0], FINALE_ASSEMBLE[1])
      // Rises the last bit into place as it assembles.
      rootY = y - (1 - easeOut(assemble)) * viewport.height * 0.15
      fx.current.burst = reduceMotion ? 0 : 1 - assemble
      fx.current.fade = reduceMotion ? (p > FINALE_ARRIVE[0] ? 0 : 1) : 1 - arrive
    } else {
      // --- Hero ---
      // window.scrollY works with or without Lenis (reduced motion).
      const screensScrolled = window.scrollY / window.innerHeight

      // Parallax: rise slower than the page, so the (scattered) cubes linger
      // on screen as a backdrop instead of shooting off the top.
      rootY = y + screensScrolled * viewport.height * PARALLAX

      // Scatter follows scroll POSITION: the further from the hero, the more
      // it comes apart, and it stays apart while you're down the page. It
      // only reassembles as you scroll back up.
      const byPosition = THREE.MathUtils.smoothstep(screensScrolled, SCATTER_START, SCATTER_END)
      // Scroll SPEED adds a temporary kick on top, so flicks feel energetic.
      const kick = Math.abs(scrollSpeed.current) * FLICK_BOOST * (1 - byPosition)
      fx.current.burst = reduceMotion ? 0 : Math.min(1, byPosition + kick)

      // Fade out once you've scrolled past the hero (#top), measured from
      // where its bottom edge is on screen, so it adapts to the panel height.
      const hero = document.getElementById('top')
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : Infinity
      fx.current.fade = THREE.MathUtils.smoothstep(1 - heroBottom / (window.innerHeight * FADE_ZONE), 0, 1)
    }
    r.position.y = rootY
    // Fully faded: stop drawing it at all (saves GPU work).
    r.visible = fx.current.fade < 0.999

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
      fx.current.burst < 0.1 // no hat tip mid-explosion
    // Finale: once whole, tip the hat goodbye every few seconds.
    const goodbye =
      finale && !reduceMotion && fx.current.burst < 0.02 && t % GOODBYE_EVERY < GOODBYE_FOR
    const tip = hovering || goodbye ? 1 : 0
    // A slightly slower "settle" than "lift" so it feels like a polite gesture.
    const speed = tip ? 7 : 4
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
        <VoxelPart voxels={parts.body} fx={fx} />
        {/* Hat pivots around its brim so the tip looks natural */}
        <group ref={hat} position={[0, HAT_BASE_Y, 0]}>
          <group position={[0, -HAT_BASE_Y, 0]}>
            <VoxelPart voxels={parts.hat} fx={fx} />
          </group>
        </group>
        {/* Eyes pivot around their own centre so blinking squashes in place */}
        <group position={[0, EYE_CENTER_Y, 0]}>
          <group ref={eyes}>
            <group position={[0, -EYE_CENTER_Y, 0]}>
              <VoxelPart voxels={parts.eyes} fx={fx} />
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
