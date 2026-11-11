import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { easeOut, finaleProgress } from './finaleProgress'

/** Ground extent (world units) and where it sits in depth. */
const WIDTH = 220
const DEPTH = 72
const NEAR_Z = -8
/** Ground height when the finale starts vs when it has fully arrived.
 *  The camera looks straight ahead from z=10 with a 35deg FOV, so a point at
 *  height y and distance d appears at y / (d * tan(17.5deg)) of the screen's
 *  half-height. With the far edge ~90 units away: START_Y -34 hides the
 *  whole landscape (and mesas) below the screen; END_Y -11 puts the horizon
 *  ~70% of the way down, below the footer's headline, date and button. */
const START_Y = -34
const END_Y = -11
/** Grid cell size and how fast the lines flow toward you. */
const CELL = 2.2
const FLOW_SPEED = 1.6

const vertexShader = /* glsl */ `
  uniform float uZOffset;
  varying vec3 vWorld;
  varying float vHeight;

  // Height of the land at world (x, z): flat canyon floor in the middle,
  // dunes toward the sides, flat-topped mesas on the far horizon.
  float landHeight(float x, float z) {
    float side = smoothstep(8.0, 40.0, abs(x));
    float dunes = (sin(x * 0.21) + sin(x * 0.13 + z * 0.17)) * 0.9 * side;
    float far = smoothstep(-48.0, -72.0, z);
    float m = sin(x * 0.07 + 1.3) * 0.6 + sin(x * 0.19 + 0.4) * 0.4;
    float mesa = smoothstep(0.12, 0.3, m) * 5.0 * far; // clipped into plateaus
    return dunes + mesa;
  }

  void main() {
    // The plane is rotated flat (-90deg about X): local y -> world -z,
    // local z -> world y.
    float worldZ = -position.y + uZOffset;
    float h = landHeight(position.x, worldZ);
    vec3 p = vec3(position.x, position.y, position.z + h);
    vHeight = h;
    vWorld = vec3(position.x, h, worldZ);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uCell;
  uniform float uFlow;
  varying vec3 vWorld;
  varying float vHeight;

  void main() {
    // Neon grid lines, flowing toward the camera over time.
    vec2 c = vec2(vWorld.x, vWorld.z + uTime * uFlow) / uCell;
    vec2 w = fwidth(c);
    vec2 g = abs(fract(c - 0.5) - 0.5) / w;
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    // Far away the cells get smaller than a pixel and shimmer: fade lines out.
    line *= 1.0 - smoothstep(0.35, 1.0, max(w.x, w.y));

    vec3 ground = vec3(0.027, 0.016, 0.06);
    vec3 neon = mix(vec3(1.0, 0.25, 0.82), vec3(0.7, 0.2, 1.0), smoothstep(-20.0, -60.0, vWorld.z));
    vec3 color = ground + neon * line * 1.4;
    // Mesa tops catch a little light.
    color += vec3(0.35, 0.1, 0.5) * smoothstep(3.0, 7.0, vHeight) * 0.35;

    // Distance haze toward the horizon colour.
    float haze = smoothstep(-25.0, -78.0, vWorld.z);
    color = mix(color, vec3(0.22, 0.05, 0.32), haze * 0.75);
    gl_FragColor = vec4(color, 1.0);
  }
`

/**
 * The finale's neon desert: a dark ground with glowing grid lines flowing
 * toward you, dunes at the sides and mesas on the horizon. Rises into view
 * as the footer's finale stage scrolls in (finaleProgress); not drawn before.
 */
export function FrontierTerrain() {
  const mesh = useRef<THREE.Mesh>(null)
  const reduceMotion = usePrefersReducedMotion()

  const geometry = useMemo(() => new THREE.PlaneGeometry(WIDTH, DEPTH, 160, 80), [])
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uCell: { value: CELL },
          uFlow: { value: FLOW_SPEED },
          uZOffset: { value: NEAR_Z - DEPTH / 2 },
        },
      }),
    [],
  )
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useFrame((state) => {
    const m = mesh.current
    if (!m) return
    const p = finaleProgress()
    m.visible = p > 0.001
    if (!m.visible) return
    m.position.y = THREE.MathUtils.lerp(START_Y, END_Y, easeOut(p))
    const u = (m.material as THREE.ShaderMaterial).uniforms
    u.uTime.value = reduceMotion ? 0 : state.clock.elapsedTime
  })

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, START_Y, NEAR_Z - DEPTH / 2]}
      visible={false}
    />
  )
}
