uniform float uProgress;

varying vec3 vNormal;
varying float vDisp;

void main() {
  vec3 deep = vec3(0.10, 0.05, 0.35); // indigo
  vec3 hot  = vec3(1.00, 0.35, 0.55); // pink

  // Colour shifts as you move down the page, plus a bit from the wobble.
  vec3 col = mix(deep, hot, clamp(uProgress + vDisp * 2.0, 0.0, 1.0));

  // Rim light: brighter where the surface faces away from the camera.
  float rim = pow(1.0 - abs(vNormal.z), 2.0);

  gl_FragColor = vec4(col + rim * 0.4, 1.0);
}
