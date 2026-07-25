// GradientScroll — a 2D custom material (WGSL, native WebGPU backend). This is a
// fragment MAIN snippet (NOT a function, unlike the 3D shader:'file' path): it writes
// `outColor` (a premultiplied vec4; the base high-shader multiplies it by vColor = the
// mesh tint/alpha). In scope: `vUV` (sprite UV), `uTexture`/`uSampler` (the sampled
// texture — unused here), and the params as `matUniforms.<name>`.
//
// A horizontal two-stop gradient scrolled along X by matUniforms.uScroll. Drive uScroll
// with a MaterialInstance { kind:'uniform', target:'uScroll', source:{ type:'time', wrap:1 } }
// to loop the scroll once per second.
let t = fract(vUV.x + matUniforms.uScroll);
let a = smoothstep(0.0, 1.0, t);
let rgb = mix(vec3<f32>(0.10, 0.20, 0.80), vec3<f32>(1.00, 0.40, 0.10), a);
outColor = vec4<f32>(rgb, 1.0);
