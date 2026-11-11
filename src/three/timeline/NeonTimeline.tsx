import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { timelineState } from './timelineState'

/** Tube thickness in screen pixels (core line, and the soft glow around it). */
const CORE_RADIUS_PX = 2.5
const HALO_RADIUS_PX = 9
/** Sideways wiggle between consecutive nodes, in pixels (keeps it alive). */
const WIGGLE_PX = 12

/**
 * Builds the tube's path in PAGE pixels from the measured node dots:
 * sweep in from off-screen right, snake through every node, sweep out right.
 */
function buildPathPx(): THREE.Vector2[] | null {
  const { nodes, width: W, height: H } = timelineState
  if (nodes.length < 2) return null
  const first = nodes[0]
  const last = nodes[nodes.length - 1]

  const pts: THREE.Vector2[] = [
    // Entry: from beyond the right edge, curving down into the first node.
    new THREE.Vector2(W * 1.08, first.y - H * 0.55),
    new THREE.Vector2(W * 0.72, first.y - H * 0.38),
    new THREE.Vector2(first.x + W * 0.12, first.y - H * 0.14),
  ]

  nodes.forEach((node, i) => {
    pts.push(new THREE.Vector2(node.x, node.y))
    const next = nodes[i + 1]
    if (next) {
      // Alternate the wiggle left/right between nodes for a gentle snake.
      const side = i % 2 === 0 ? 1 : -1
      pts.push(new THREE.Vector2((node.x + next.x) / 2 + side * WIGGLE_PX, (node.y + next.y) / 2))
    }
  })

  // Exit: drop below the last event, then sweep out to the right.
  // (Phase 2 will continue this into the footer's horizon.)
  pts.push(
    new THREE.Vector2(last.x, last.y + H * 0.14),
    new THREE.Vector2(W * 0.45, last.y + H * 0.34),
    new THREE.Vector2(W * 1.08, last.y + H * 0.44),
  )
  return pts
}

/**
 * The schedule's neon light tube, drawn in the shared 3D canvas.
 *
 * Built in "page space": a page pixel (x, y) maps to world
 *   x = (x / W - 0.5) * viewport.width
 *   y = viewport.height / 2 - (y / H) * viewport.height
 * and each frame the group moves up by the scroll distance in world units,
 * so the tube scrolls exactly with the page and stays on the HTML dots.
 */
export function NeonTimeline() {
  const viewport = useThree((s) => s.viewport)
  const group = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)
  const builtFor = useRef('')

  const coreMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ff4fd8', toneMapped: false }),
    [],
  )
  const haloMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#b400ff',
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )
  useEffect(
    () => () => {
      coreMaterial.dispose()
      haloMaterial.dispose()
      core.current?.geometry.dispose()
      halo.current?.geometry.dispose()
    },
    [coreMaterial, haloMaterial],
  )

  useFrame(() => {
    const g = group.current
    const c = core.current
    const h = halo.current
    if (!g || !c || !h) return
    const { width: W, height: H } = timelineState

    // Rebuild the tube when the layout was re-measured or the canvas resized.
    const key = `${timelineState.version}:${viewport.width.toFixed(3)}:${viewport.height.toFixed(3)}`
    if (key !== builtFor.current) {
      builtFor.current = key
      const px = buildPathPx()
      if (px) {
        const toWorld = (p: THREE.Vector2) =>
          new THREE.Vector3((p.x / W - 0.5) * viewport.width, viewport.height / 2 - (p.y / H) * viewport.height, 0)
        const curve = new THREE.CatmullRomCurve3(px.map(toWorld), false, 'centripetal')
        const segments = THREE.MathUtils.clamp(px.length * 24, 200, 1400)
        const pxToWorld = viewport.height / H

        c.geometry.dispose()
        h.geometry.dispose()
        c.geometry = new THREE.TubeGeometry(curve, segments, CORE_RADIUS_PX * pxToWorld, 10, false)
        h.geometry = new THREE.TubeGeometry(curve, segments, HALO_RADIUS_PX * pxToWorld, 10, false)
      }
    }

    // Scroll with the page.
    g.position.y = (window.scrollY / H) * viewport.height

    // Only draw while the schedule is on (or near) the screen.
    const top = timelineState.sectionTop - window.scrollY
    const bottom = timelineState.sectionBottom - window.scrollY
    g.visible = timelineState.nodes.length > 1 && top < H * 1.2 && bottom > -H * 0.6
  })

  return (
    <group ref={group}>
      <mesh ref={halo} material={haloMaterial} renderOrder={1} />
      <mesh ref={core} material={coreMaterial} renderOrder={2} />
    </group>
  )
}
