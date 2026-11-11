import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LIT_LINE, timelineState } from './timelineState'

/** Tube thickness in screen pixels (core line, and the soft glow around it). */
const CORE_RADIUS_PX = 2.5
const HALO_RADIUS_PX = 9
/** Sideways wiggle between consecutive nodes, in pixels (keeps it alive). */
const WIGGLE_PX = 12
/** Length of the bright pulse head along the tube, in pixels. */
const HEAD_PX = 46
/** How many points along the curve to sample for the pulse lookup. */
const SAMPLES = 600
/** Node flare radius in pixels (day markers get a bigger one). */
const FLARE_PX = { day: 22, event: 14 }
/** Most nodes we allocate flares for. */
const MAX_NODES = 64
const FLARE_COLOR = new THREE.Color('#ff3fd2')
// Scratch objects reused every frame (no garbage per frame).
const flareScratch = new THREE.Matrix4()
const colorScratch = new THREE.Color()

// Shared by the core and halo shaders. `uHead` = how far along the tube the
// pulse is (0 = start, 1 = end); `uHeadWidth` = pulse length in the same units.
const vertexShader = /* glsl */ `
  varying float vAlong;
  void main() {
    vAlong = uv.x; // TubeGeometry: uv.x runs 0 -> 1 along the path
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const coreFragment = /* glsl */ `
  uniform float uHead;
  uniform float uHeadWidth;
  uniform float uTime;
  varying float vAlong;
  void main() {
    float behind = 1.0 - smoothstep(uHead - uHeadWidth * 0.2, uHead, vAlong);
    // Lit: hot pink with a slow shimmer flowing along the tube.
    float shimmer = 0.85 + 0.15 * sin(vAlong * 260.0 - uTime * 3.0);
    vec3 lit = vec3(1.0, 0.31, 0.85) * shimmer;
    vec3 dim = vec3(0.28, 0.12, 0.55) * 0.45; // unlit violet tube
    vec3 color = mix(dim, lit, behind);
    // Bright white-pink flare at the head.
    float d = (vAlong - uHead) / uHeadWidth;
    color += vec3(1.0, 0.85, 1.0) * exp(-d * d) * 2.2;
    gl_FragColor = vec4(color, 1.0);
  }
`

const haloFragment = /* glsl */ `
  uniform float uHead;
  uniform float uHeadWidth;
  varying float vAlong;
  void main() {
    float behind = 1.0 - smoothstep(uHead - uHeadWidth * 0.2, uHead, vAlong);
    float d = (vAlong - uHead) / (uHeadWidth * 1.8);
    float glow = mix(0.05, 0.2, behind) + exp(-d * d) * 0.55;
    gl_FragColor = vec4(vec3(0.71, 0.0, 1.0) * glow, glow);
  }
`

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
 *
 * A light pulse travels along it: wherever the tube crosses LIT_LINE (the
 * same line the schedule rows light up on) is the pulse head; the tube is
 * lit behind it and dim ahead of it. Each node has a soft flare behind its
 * HTML dot that flashes as the pulse arrives, then settles into a glow.
 */
export function NeonTimeline() {
  const viewport = useThree((s) => s.viewport)
  const group = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Mesh>(null)
  const builtFor = useRef('')

  // One uniforms object shared by both materials, so one write updates both.
  const uniforms = useMemo(
    () => ({ uHead: { value: 0 }, uHeadWidth: { value: 0.01 }, uTime: { value: 0 } }),
    [],
  )
  const coreMaterial = useMemo(
    () => new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader: coreFragment, toneMapped: false }),
    [uniforms],
  )
  const haloMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader: haloFragment,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [uniforms],
  )
  // World-space height of the curve at SAMPLES evenly spaced points along it
  // (arc length, the same spacing TubeGeometry's uv.x uses).
  const samplesY = useRef<Float32Array>(new Float32Array(0))

  // Node flares: one instanced, additive sphere per node, glowing behind the
  // HTML dot. nodeAlong = each node's position along the tube (0..1).
  const flares = useRef<THREE.InstancedMesh>(null)
  const nodeAlong = useRef<number[]>([])
  const nodeBase = useRef<{ pos: THREE.Vector3; size: number }[]>([])
  const flareGeometry = useMemo(() => new THREE.SphereGeometry(1, 20, 20), [])
  const flareColors = useMemo(() => new Float32Array(MAX_NODES * 3), [])
  const flareMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )
  useEffect(
    () => () => {
      flareGeometry.dispose()
      flareMaterial.dispose()
    },
    [flareGeometry, flareMaterial],
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

  useFrame((state) => {
    const g = group.current
    const c = core.current
    const h = halo.current
    if (!g || !c || !h) return
    const { width: W, height: H } = timelineState
    // Shared uniforms, reached through the mesh (both materials use the same object).
    const u = (c.material as THREE.ShaderMaterial).uniforms

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

        // Pulse lookup table + head length as a share of the whole tube.
        const ys = new Float32Array(SAMPLES + 1)
        for (let i = 0; i <= SAMPLES; i++) ys[i] = curve.getPointAt(i / SAMPLES).y
        samplesY.current = ys
        u.uHeadWidth.value = (HEAD_PX * pxToWorld) / curve.getLength()

        // Each node's place along the tube: the first sample at/below its height.
        const along: number[] = []
        const base: { pos: THREE.Vector3; size: number }[] = []
        timelineState.nodes.slice(0, MAX_NODES).forEach((node) => {
          const pos = toWorld(new THREE.Vector2(node.x, node.y))
          let i = 0
          while (i < SAMPLES && ys[i] > pos.y) i++
          along.push(i / SAMPLES)
          base.push({ pos, size: FLARE_PX[node.kind] * pxToWorld })
        })
        nodeAlong.current = along
        nodeBase.current = base
        if (flares.current) flares.current.count = along.length
      }
    }

    // --- Pulse: sits where the tube crosses the lit line on screen ---
    // The lit line in the tube's page-space world coordinates:
    const linePageY = window.scrollY + LIT_LINE * H
    const lineWorldY = viewport.height / 2 - (linePageY / H) * viewport.height
    // The path runs downward, so find the first sample at or below the line.
    const ys = samplesY.current
    if (ys.length > 1) {
      let lo = 0
      let hi = ys.length - 1
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (ys[mid] > lineWorldY) lo = mid + 1
        else hi = mid
      }
      u.uHead.value = lo / (ys.length - 1)
    }
    u.uTime.value = state.clock.elapsedTime

    // --- Node flares: faint before the pulse, flash as it arrives, then a
    // steady glow that the flash fades into as the pulse moves on ---
    const f = flares.current
    if (f) {
      const head = u.uHead.value
      const fade = u.uHeadWidth.value * 6 // flash fades over ~6 head-lengths
      nodeAlong.current.forEach((along, i) => {
        const passed = head >= along
        const flash = passed ? Math.exp(-(head - along) / fade) : 0
        const intensity = (passed ? 0.45 : 0.08) + flash * 1.6
        const { pos, size } = nodeBase.current[i]
        flareScratch.makeScale(size * (1 + flash), size * (1 + flash), size * (1 + flash))
        flareScratch.setPosition(pos)
        f.setMatrixAt(i, flareScratch)
        f.setColorAt(i, colorScratch.copy(FLARE_COLOR).multiplyScalar(intensity))
      })
      f.instanceMatrix.needsUpdate = true
      if (f.instanceColor) f.instanceColor.needsUpdate = true
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
      <instancedMesh
        ref={flares}
        args={[flareGeometry, flareMaterial, MAX_NODES]}
        count={0}
        frustumCulled={false}
        renderOrder={3}
      >
        {/* Allocated up front so colours work from the first frame */}
        <instancedBufferAttribute attach="instanceColor" args={[flareColors, 3]} />
      </instancedMesh>
    </group>
  )
}
