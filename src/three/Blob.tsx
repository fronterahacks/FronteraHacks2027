import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { scrollState } from '../scroll/scrollState'
import { BlobMaterial } from './materials/BlobMaterial'

/** A wobbly sphere that reacts to scroll speed and position. */
export function Blob() {
  const mesh = useRef<THREE.Mesh<THREE.BufferGeometry, BlobMaterial>>(null)
  const material = useMemo(() => new BlobMaterial(), [])

  useFrame((_, delta) => {
    if (!mesh.current) return
    const u = mesh.current.material.uniforms

    // Damp toward the raw scroll velocity so the effect eases in and out
    // instead of jumping. Higher lambda (4) = snappier, lower = floatier.
    u.uVelocity.value = THREE.MathUtils.damp(u.uVelocity.value, scrollState.velocity, 4, delta)
    u.uProgress.value = scrollState.progress
    u.uTime.value += delta

    // Spin a little faster while scrolling.
    mesh.current.rotation.y += delta * (0.1 + Math.abs(u.uVelocity.value) * 0.01)
  })

  return (
    <mesh ref={mesh} material={material}>
      <icosahedronGeometry args={[1.4, 64]} />
    </mesh>
  )
}
