import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Voxel } from './voxels'

/** Cubes are slightly smaller than a grid cell, leaving thin gaps whose
 *  edges catch the light, so it reads as voxels rather than a flat sprite. */
const CUBE = 0.9

// One shared unit cube; each instance is scaled to its voxel's depth.
const geometry = new THREE.BoxGeometry(1, 1, 1)

/**
 * Draws a list of voxels as ONE InstancedMesh: a single GPU draw call for
 * hundreds of cubes, each with its own position, depth and colour.
 */
export function VoxelPart({ voxels }: { voxels: Voxel[] }) {
  const mesh = useRef<THREE.InstancedMesh>(null)

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

  // Place every cube once. (Animations later move the parent groups, or
  // rewrite these matrices per frame for the scroll "burst".)
  useLayoutEffect(() => {
    const m = mesh.current
    if (!m) return
    const matrix = new THREE.Matrix4()
    const color = new THREE.Color()
    voxels.forEach((v, i) => {
      matrix.makeScale(CUBE, CUBE, v.depth * CUBE)
      matrix.setPosition(v.x, v.y, v.z)
      m.setMatrixAt(i, matrix)
      m.setColorAt(i, color.set(v.color))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.computeBoundingSphere()
  }, [voxels])

  return <instancedMesh ref={mesh} args={[geometry, material, voxels.length]} />
}
