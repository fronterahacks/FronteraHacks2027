import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { scrollState } from '../scroll/scrollState'
import { BlobMaterial } from './materials/BlobMaterial'

type BlobMaterialInstance = InstanceType<typeof BlobMaterial>

/** A wobbly sphere that reacts to scroll speed and position. */
export function Blob() {
  const mesh = useRef<THREE.Mesh<THREE.BufferGeometry, BlobMaterialInstance>>(null)
  const material = useMemo(() => new BlobMaterial(), [])

  useFrame((_, delta) => {
    if (!mesh.current) return
    const m = mesh.current.material

    // Damp toward the raw scroll velocity so the effect eases in and out
    // instead of jumping. Higher lambda (4) = snappier, lower = floatier.
    m.uVelocity = THREE.MathUtils.damp(m.uVelocity, scrollState.velocity, 4, delta)
    m.uProgress = scrollState.progress
    m.uTime += delta

    // Spin a little faster while scrolling.
    mesh.current.rotation.y += delta * (0.1 + Math.abs(m.uVelocity) * 0.01)
  })

  return (
    <mesh ref={mesh} material={material}>
      <icosahedronGeometry args={[1.4, 64]} />
    </mesh>
  )
}
