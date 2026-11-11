import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { easeOut, finaleProgress } from './finaleProgress'
import { TERRAIN } from './terrainConfig'

/** Line length and thickness (world units; ~0.063 units per pixel at this
 *  distance on a 900px-tall screen). */
const LENGTH = 220
const CORE_RADIUS = 0.13
const HALO_RADIUS = 0.5
/** Share of finale progress over which the pulse crosses the horizon. */
const PULSE_FROM = 0.3
const PULSE_TO = 0.8

const vertexShader = /* glsl */ `
  uniform float uLength;
  varying float vAlong;
  void main() {
    // Cylinder's own Y axis runs along the line (rotated to world X):
    // 0 at the left end, 1 at the right.
    vAlong = position.y / uLength + 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/** Lit to the right of the pulse head (it travels right -> left), dim to the
 *  left, with a bright flare at the head. Same palette as the schedule tube. */
const lineFragment = (halo: boolean) => /* glsl */ `
  uniform float uHead;
  varying float vAlong;
  void main() {
    float lit = smoothstep(uHead - 0.004, uHead + 0.004, vAlong);
    float d = (vAlong - uHead) / 0.012;
    float flare = exp(-d * d);
    ${
      halo
        ? `float glow = mix(0.04, 0.22, lit) + flare * 0.7;
           gl_FragColor = vec4(vec3(0.71, 0.0, 1.0) * glow, glow);`
        : `vec3 color = mix(vec3(0.12, 0.05, 0.25), vec3(1.0, 0.31, 0.85), lit);
           color += vec3(1.0, 0.85, 1.0) * flare * 2.5;
           gl_FragColor = vec4(color, 1.0);`
    }
  }
`

/**
 * The finale's neon horizon: the same light-tube look as the schedule
 * timeline, laid along the far edge of the desert. As the footer arrives,
 * the pulse "returns", racing in from the right (where the schedule tube
 * left the screen) and lighting the horizon behind it.
 */
export function FrontierHorizon() {
  const group = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(() => ({ uHead: { value: 1 }, uLength: { value: LENGTH } }), [])
  const coreGeometry = useMemo(() => new THREE.CylinderGeometry(CORE_RADIUS, CORE_RADIUS, LENGTH, 8, 1, true), [])
  const haloGeometry = useMemo(() => new THREE.CylinderGeometry(HALO_RADIUS, HALO_RADIUS, LENGTH, 8, 1, true), [])
  const coreMaterial = useMemo(
    () => new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader: lineFragment(false), toneMapped: false }),
    [uniforms],
  )
  const haloMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader: lineFragment(true),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [uniforms],
  )
  useEffect(
    () => () => {
      coreGeometry.dispose()
      haloGeometry.dispose()
      coreMaterial.dispose()
      haloMaterial.dispose()
    },
    [coreGeometry, haloGeometry, coreMaterial, haloMaterial],
  )

  useFrame(() => {
    const g = group.current
    const c = core.current
    if (!g || !c) return
    const p = finaleProgress()
    g.visible = p > 0.001
    if (!g.visible) return
    // Ride the far edge of the ground as it rises.
    g.position.y = THREE.MathUtils.lerp(TERRAIN.START_Y, TERRAIN.END_Y, easeOut(p)) + 0.15
    // Pulse head: 1 (right end) -> 0 (left end) while the footer arrives.
    const u = (c.material as THREE.ShaderMaterial).uniforms
    u.uHead.value = 1 - THREE.MathUtils.smoothstep(p, PULSE_FROM, PULSE_TO)
  })

  return (
    <group ref={group} position={[0, TERRAIN.START_Y, TERRAIN.FAR_Z]} rotation={[0, 0, -Math.PI / 2]} visible={false}>
      <mesh geometry={haloGeometry} material={haloMaterial} renderOrder={1} />
      <mesh ref={core} geometry={coreGeometry} material={coreMaterial} renderOrder={2} />
    </group>
  )
}
