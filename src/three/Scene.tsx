import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import { Blob } from './Blob'

/**
 * The full-screen WebGL canvas that sits behind the page content.
 * Loaded lazily from App so text renders before Three.js downloads.
 * Starts transparent and fades in once WebGL is ready, so the CSS gradient
 * behind it is what users see while the scene loads (no black flash).
 */
export default function Scene() {
  const [ready, setReady] = useState(false)

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: false, alpha: true }}
      onCreated={() => setReady(true)}
      className={`transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
    >
      <Blob />
    </Canvas>
  )
}
