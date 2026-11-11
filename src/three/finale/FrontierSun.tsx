import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { easeOut, finaleProgress } from './finaleProgress'

/** Just behind the terrain's far edge (z -80), so the ground and mesas
 *  hide the sun's lower part. */
const SUN_Z = -86
const SUN_RADIUS = 13
/** Sun centre height as the finale starts vs once arrived. Ends level with
 *  the horizon (~ -11.7 at this depth): a half sun setting behind the mesas,
 *  kept low so it doesn't sit behind the footer headline. */
const SUN_START_Y = -48
const SUN_END_Y = -11.5

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/** Striped neon sun: pale pink -> hot pink -> purple, stripes widening
 *  toward the bottom, soft edge. */
const sunFragment = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;          // -1..1 across the disc
    float r = length(p);
    float disc = 1.0 - smoothstep(0.97, 1.0, r);
    vec3 top = vec3(1.0, 0.5, 0.88); // hot pink, not near-white: white text may sit over it
    vec3 mid = vec3(1.0, 0.25, 0.82);
    vec3 bottom = vec3(0.6, 0.05, 1.0);
    float t = vUv.y;
    vec3 color = mix(bottom, mid, smoothstep(0.0, 0.55, t));
    color = mix(color, top, smoothstep(0.55, 1.0, t));
    // Horizontal stripes in the lower 55%, gaps widening downward.
    float below = smoothstep(0.55, 0.0, t);
    float band = fract(t * 14.0);
    float gap = below * 0.55;
    float stripes = step(gap, band);
    float alpha = disc * mix(1.0, stripes, step(0.001, below));
    gl_FragColor = vec4(color * 1.25, alpha);
  }
`

/** Soft radial pink -> purple sky glow around the sun (additive). */
const glowFragment = /* glsl */ `
  varying vec2 vUv;
  void main() {
    float d = length(vUv * 2.0 - 1.0);
    float g = pow(max(0.0, 1.0 - d), 2.2);
    vec3 color = mix(vec3(0.45, 0.0, 0.75), vec3(1.0, 0.2, 0.7), g);
    gl_FragColor = vec4(color * g * 0.9, g);
  }
`

/**
 * The finale's neon sunset: striped sun setting behind the mesas, with a
 * soft glow in the sky. Rises into place as the footer arrives.
 */
export function FrontierSun() {
  const group = useRef<THREE.Group>(null)

  const sunGeometry = useMemo(() => new THREE.PlaneGeometry(SUN_RADIUS * 2, SUN_RADIUS * 2), [])
  const glowGeometry = useMemo(() => new THREE.PlaneGeometry(SUN_RADIUS * 6, SUN_RADIUS * 4), [])
  const sunMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: sunFragment,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )
  const glowMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: glowFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  )
  useEffect(
    () => () => {
      sunGeometry.dispose()
      glowGeometry.dispose()
      sunMaterial.dispose()
      glowMaterial.dispose()
    },
    [sunGeometry, glowGeometry, sunMaterial, glowMaterial],
  )

  useFrame(() => {
    const g = group.current
    if (!g) return
    const p = finaleProgress()
    g.visible = p > 0.001
    if (!g.visible) return
    // Starts a beat after the ground so it settles last.
    const t = easeOut(THREE.MathUtils.clamp((p - 0.1) / 0.9, 0, 1))
    g.position.y = THREE.MathUtils.lerp(SUN_START_Y, SUN_END_Y, t)
  })

  return (
    <group ref={group} position={[0, SUN_START_Y, SUN_Z]} visible={false}>
      <mesh geometry={glowGeometry} material={glowMaterial} position={[0, 0, -2]} renderOrder={-2} />
      <mesh geometry={sunGeometry} material={sunMaterial} renderOrder={-1} />
    </group>
  )
}
