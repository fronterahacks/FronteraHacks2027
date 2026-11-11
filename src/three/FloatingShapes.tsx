import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

type Kind = 'torusKnot' | 'torus' | 'sphere' | 'roundedBox' | 'capsule' | 'icosahedron'
type Finish = 'chrome' | 'glass' | 'gloss'

type ShapeConfig = {
  kind: Kind
  finish: Finish
  /** Only used by 'gloss'. */
  color?: string
  /** Position as a fraction of the visible screen, from the centre:
   *  x: -0.5 (left edge) .. 0.5 (right edge), y: -0.5 (bottom) .. 0.5 (top). */
  x: number
  y: number
  /** Depth: positive = closer to the camera. */
  z: number
  scale: number
}

/**
 * The arrangement. Mostly upper-right so the hero headline (bottom-left)
 * stays readable. Tweak freely: this list is the whole composition.
 */
const SHAPES: ShapeConfig[] = [
  { kind: 'torusKnot', finish: 'chrome', x: 0.26, y: 0.16, z: 0, scale: 1.15 },
  { kind: 'sphere', finish: 'glass', x: 0.08, y: 0.3, z: 1.2, scale: 0.85 },
  { kind: 'roundedBox', finish: 'gloss', color: '#b400ff', x: 0.4, y: -0.06, z: -1, scale: 0.95 },
  { kind: 'torus', finish: 'gloss', color: '#ff00c8', x: 0.02, y: 0.04, z: -2.5, scale: 0.9 },
  { kind: 'capsule', finish: 'chrome', x: 0.43, y: 0.36, z: -1.5, scale: 0.6 },
  { kind: 'icosahedron', finish: 'glass', x: -0.2, y: 0.33, z: -3, scale: 0.75 },
  { kind: 'sphere', finish: 'gloss', color: '#6333ff', x: 0.2, y: -0.22, z: 1.6, scale: 0.42 },
  { kind: 'torus', finish: 'chrome', x: -0.4, y: 0.4, z: -3.5, scale: 0.55 },
]

// One geometry per kind, shared by every shape that uses it.
const geometries: Record<Kind, THREE.BufferGeometry> = {
  torusKnot: new THREE.TorusKnotGeometry(0.7, 0.24, 220, 32),
  torus: new THREE.TorusGeometry(0.75, 0.28, 48, 120),
  sphere: new THREE.SphereGeometry(0.9, 64, 64),
  roundedBox: new RoundedBoxGeometry(1.3, 1.3, 1.3, 6, 0.28),
  capsule: new THREE.CapsuleGeometry(0.45, 1.1, 12, 32),
  icosahedron: new THREE.IcosahedronGeometry(0.95, 0),
}

function makeMaterial(finish: Finish, color = '#ffffff'): THREE.Material {
  switch (finish) {
    case 'chrome':
      // Mirror metal: all its colour comes from reflecting the studio panels.
      return new THREE.MeshPhysicalMaterial({ color: '#ece6ff', metalness: 1, roughness: 0.12 })
    case 'glass':
      // See-through, refracts what's behind it, with a thin-film rainbow sheen.
      return new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        transmission: 1,
        thickness: 1.4,
        roughness: 0.04,
        ior: 1.45,
        iridescence: 0.7,
        iridescenceIOR: 1.3,
        attenuationColor: new THREE.Color('#c084fc'),
        attenuationDistance: 2.5,
      })
    case 'gloss':
      // Candy-coloured plastic under a clear lacquer coat.
      return new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.1,
        roughness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
      })
  }
}

function Shape({ config, index }: { config: ShapeConfig; index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const viewport = useThree((s) => s.viewport)
  const material = useMemo(() => makeMaterial(config.finish, config.color), [config.finish, config.color])
  useEffect(() => () => material.dispose(), [material]) // free GPU memory on unmount

  // Each shape gets its own rhythm so they don't bob in sync.
  const seed = index * 1.7
  const spin = 0.6 + (index % 3) * 0.25

  // Shrink everything on narrow (phone) screens so shapes don't crowd.
  const fit = Math.min(1, viewport.width / 11)
  const baseX = config.x * viewport.width
  const baseY = config.y * viewport.height

  useFrame((state, delta) => {
    const mesh = ref.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    // Gentle float: slow up/down drift plus a slight sideways sway.
    mesh.position.set(
      baseX + Math.cos(t * 0.4 + seed) * 0.08,
      baseY + Math.sin(t * 0.6 + seed) * 0.18,
      config.z,
    )
    mesh.rotation.x += delta * 0.15 * spin
    mesh.rotation.y += delta * 0.22 * spin
  })

  return (
    <mesh
      ref={ref}
      geometry={geometries[config.kind]}
      material={material}
      scale={config.scale * fit}
      rotation={[seed, seed * 0.5, 0]}
    />
  )
}

/** The hero's glossy floating shapes. */
export function FloatingShapes() {
  return (
    <group>
      {SHAPES.map((config, i) => (
        <Shape key={i} config={config} index={i} />
      ))}
    </group>
  )
}
