import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import { FloatingShapes } from './FloatingShapes'
import { StudioEnvironment } from './StudioEnvironment'

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
      // Narrow field of view from further back = less perspective
      // distortion, so shapes look like objects rather than fisheye blobs.
      camera={{ position: [0, 0, 10], fov: 35 }}
      // Antialiasing on: glossy edges show jaggies badly without it.
      gl={{ antialias: true, alpha: true }}
      onCreated={() => setReady(true)}
      className={`transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
    >
      <StudioEnvironment />
      {/* A key light for crisp specular highlights on top of the reflections */}
      <directionalLight position={[4, 6, 5]} intensity={1.2} />
      <FloatingShapes />
    </Canvas>
  )
}
