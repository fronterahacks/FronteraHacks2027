import { shaderMaterial } from '@react-three/drei'
import fragmentShader from '../shaders/blob.frag?raw'
import vertexShader from '../shaders/blob.vert?raw'

/**
 * ShaderMaterial whose uniforms are driven by scroll:
 * - uVelocity: scroll speed, controls how much the surface wobbles
 * - uProgress: page position (0..1), controls colour
 * - uTime: seconds elapsed, keeps the surface gently moving
 */
export const BlobMaterial = shaderMaterial(
  { uTime: 0, uVelocity: 0, uProgress: 0 },
  vertexShader,
  fragmentShader,
)
