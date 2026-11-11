import { Canvas } from '@react-three/fiber'

/**
 * The full-screen WebGL canvas that sits behind the page content.
 * Loaded lazily from App so text renders before Three.js downloads.
 */
export default function Scene() {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: false }}>
      {/* Placeholder object so we can see the canvas is working. */}
      <mesh>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshNormalMaterial wireframe />
      </mesh>
    </Canvas>
  )
}
