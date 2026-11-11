uniform float uTime;
uniform float uVelocity;

varying vec3 vNormal;
varying float vDisp;

// Cheap layered sine "noise". Good enough to start; swap for simplex later.
float wave(vec3 p) {
  return sin(p.x * 3.0 + uTime) * sin(p.y * 3.0 + uTime * 0.8) * sin(p.z * 3.0 + uTime * 0.6);
}

void main() {
  // Map scroll speed to 0..1. Faster scrolling = stronger wobble.
  float intensity = clamp(abs(uVelocity) / 40.0, 0.0, 1.0);
  float d = wave(position) * (0.08 + intensity * 0.45);

  vec3 displaced = position + normal * d;

  vNormal = normalize(normalMatrix * normal);
  vDisp = d;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
