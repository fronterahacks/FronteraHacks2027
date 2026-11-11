import { useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Builds a tiny invisible "photo studio" (glowing panels in the Frontera
 * palette around the origin) and renders it once into a prefiltered
 * environment map (PMREM) that glossy materials can reflect.
 */
function buildStudioEnvMap(gl: THREE.WebGLRenderer) {
  const studio = new THREE.Scene()
  studio.background = new THREE.Color('#07040f')

  const panel = (color: string, intensity: number, size: [number, number], pos: [number, number, number]) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(...size),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        side: THREE.DoubleSide,
      }),
    )
    mesh.position.set(...pos)
    mesh.lookAt(0, 0, 0)
    studio.add(mesh)
  }

  panel('#ffffff', 3, [6, 1.2], [0, 6, 2]) // soft white key light from above
  panel('#b400ff', 4, [3, 8], [-7, 0, 3]) // purple strip, left
  panel('#ff00c8', 3, [3, 6], [7, 1, -2]) // pink strip, right
  panel('#6333ff', 2.5, [10, 2], [0, -5, -4]) // violet floor bounce
  panel('#12c2e9', 1.5, [2, 2], [3, 3, 6]) // small cyan accent, front

  const pmrem = new THREE.PMREMGenerator(gl)
  const target = pmrem.fromScene(studio, 0.04)

  // The studio was only needed to take the "photo"; free it.
  pmrem.dispose()
  studio.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose()
      ;(o.material as THREE.Material).dispose()
    }
  })

  return target
}

/**
 * Glossy materials look glossy because they reflect their surroundings.
 * This sets the studio map above as the scene's environment, so every
 * metal/glass material reflects purple, pink and white light.
 *
 * Done by hand instead of drei's <Environment>, which pulls in large HDR
 * loader libraries we don't need.
 */
export function StudioEnvironment() {
  const gl = useThree((s) => s.gl)
  const target = useMemo(() => buildStudioEnvMap(gl), [gl])

  useEffect(() => () => target.dispose(), [target])

  // attach="environment" sets scene.environment while this is mounted.
  return <primitive object={target.texture} attach="environment" />
}
