// GradientScroll — a 2D custom material (GLSL, WebGL2 fallback backend). Fragment MAIN
// snippet: writes `outColor` (premultiplied; the base multiplies by vColor). In scope:
// `vUV`, `uTexture`/`uSampler`, and the params as LOOSE uniforms (`uScroll`). Mirrors
// gradient-scroll.wgsl.
float t = fract(vUV.x + uScroll);
float a = smoothstep(0.0, 1.0, t);
vec3 rgb = mix(vec3(0.10, 0.20, 0.80), vec3(1.00, 0.40, 0.10), a);
outColor = vec4(rgb, 1.0);
