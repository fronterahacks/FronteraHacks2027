import * as THREE from 'three'
import fragmentShader from '../shaders/blob.frag?raw'
import vertexShader from '../shaders/blob.vert?raw'

/**
 * ShaderMaterial whose uniforms are driven by scroll:
 * - uVelocity: scroll speed, controls how much the surface wobbles
 * - uProgress: page position (0..1), controls colour
 * - uTime: seconds elapsed, keeps the surface gently moving
 *
 * Written as a plain Three.js class rather than drei's shaderMaterial helper:
 * importing from '@react-three/drei' pulls the whole library (~11 MB) into the
 * dev server, which made the page sit black for seconds on load.
 */
export class BlobMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uVelocity: { value: 0 },
        uProgress: { value: 0 },
      },
    })
  }
}
