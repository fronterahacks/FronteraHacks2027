import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mascotFx } from './mascotFx'
import type { Voxel } from './voxels'

/** Cubes are slightly smaller than a grid cell, leaving thin gaps whose
 *  edges catch the light, so it reads as voxels rather than a flat sprite. */
const CUBE = 0.9
/** How far cubes fly when fully scattered (grid cells) and how much they
 *  tumble. Wide enough that the cubes spread across the screen. */
const BURST_DISTANCE = 30
const BURST_SPIN = 3
/** Once scattered, cubes keep drifting: how far (cells) and how fast. */
const DRIFT = 1.5
const DRIFT_SPEED = 0.35
/** Below this scatter amount the figure snaps exactly back together. */
const REST_THRESHOLD = 0.004

// One shared unit cube; each instance is scaled to its voxel's depth.
const geometry = new THREE.BoxGeometry(1, 1, 1)

/** Deterministic pseudo-random 0..1 from an integer (same result every time). */
function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

/**
 * Draws a list of voxels as ONE InstancedMesh: a single GPU draw call for
 * hundreds of cubes, each with its own position, depth and colour.
 *
 * While mascotFx.burst > 0 (scrolling away from the hero), every cube flies
 * outward along its own direction, tumbles, and keeps drifting gently; it
 * glides back into place as burst returns to 0.
 */
export function VoxelPart({ voxels }: { voxels: Voxel[] }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const wasBurst = useRef(false)

  // Glossy lacquered-toy finish; colour comes from each instance.
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        roughness: 0.32,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])

  // Each cube's flight path: mostly outward from the figure's centre, with
  // some per-cube variation and a random tumble axis.
  const flights = useMemo(
    () =>
      voxels.map((v, i) => {
        const dir = new THREE.Vector3(
          v.x + (hash(i) - 0.5) * 8,
          v.y + (hash(i + 1000) - 0.5) * 8,
          (hash(i + 2000) - 0.5) * 30,
        ).normalize()
        const reach = 0.5 + hash(i + 3000) // some cubes fly further than others
        const axis = new THREE.Vector3(hash(i + 4000) - 0.5, hash(i + 5000) - 0.5, hash(i + 6000) - 0.5).normalize()
        return { dir, reach, axis }
      }),
    [voxels],
  )

  // Place every cube exactly at its assembled position. Used on mount, and
  // again whenever the scatter returns to ~0 so the figure is pixel-perfect.
  const writeRestPose = (m: THREE.InstancedMesh) => {
    const matrix = new THREE.Matrix4()
    voxels.forEach((v, i) => {
      matrix.makeScale(CUBE, CUBE, v.depth * CUBE)
      matrix.setPosition(v.x, v.y, v.z)
      m.setMatrixAt(i, matrix)
    })
    m.instanceMatrix.needsUpdate = true
  }

  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    writeRestPose(m)
    const color = new THREE.Color()
    voxels.forEach((v, i) => m.setColorAt(i, color.set(v.color)))
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.computeBoundingSphere()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- writeRestPose only depends on voxels
  }, [voxels])

  // Scratch objects reused every frame (no garbage per frame).
  const scratch = useMemo(
    () => ({
      matrix: new THREE.Matrix4(),
      pos: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      scale: new THREE.Vector3(),
    }),
    [],
  )

  useFrame((state) => {
    const m = mesh.current
    if (!m) return
    const burst = mascotFx.burst
    // Close enough to assembled: snap every cube exactly home (once), then
    // skip all per-cube work until it scatters again. Without this, tiny
    // leftover values leave cubes slightly tilted/squashed at the top.
    if (burst < REST_THRESHOLD) {
      if (wasBurst.current) {
        writeRestPose(m)
        wasBurst.current = false
      }
      return
    }
    wasBurst.current = true

    const { matrix, pos, quat, scale } = scratch
    const t = state.clock.elapsedTime
    const trail = -mascotFx.direction * 6 // cubes trail opposite the scroll

    voxels.forEach((v, i) => {
      const f = flights[i]
      const d = burst * BURST_DISTANCE * f.reach
      // Slow floating drift, growing as the cube gets further from home.
      const phase = t * DRIFT_SPEED + i
      const driftX = Math.sin(phase) * DRIFT * burst
      const driftY = Math.cos(phase * 0.8) * DRIFT * burst
      pos.set(
        v.x + f.dir.x * d + driftX,
        v.y + f.dir.y * d + driftY + trail * burst * f.reach,
        v.z + f.dir.z * d,
      )
      // Tumble: a fixed amount from scattering, plus a slow rocking that
      // stays bounded (sin), so it can't build up the longer the page is open.
      quat.setFromAxisAngle(f.axis, burst * (BURST_SPIN * f.reach + Math.sin(t * 0.4 + i) * 0.8))
      scale.set(CUBE, CUBE, v.depth * CUBE * (1 - burst * 0.6)) // long cubes shrink to chunks in flight
      matrix.compose(pos, quat, scale)
      m.setMatrixAt(i, matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={mesh} args={[geometry, material, voxels.length]} frustumCulled={false} />
}
