# Particle Demo — Modoki

![A glowing cyan "Energy Jet" effect — a narrow cone of trailed sparks rising out of a
near-black void, with the caption "6 Energy Jet — trailed sparks" over the dark
backdrop](screenshot.png)

A **dark VFX showreel** built on the [Modoki](https://modoki-engine.com) engine's particle
system: a near-black studio void where bloom-bright, additive, saturated effects are the
only light source — the Unity/Unreal VFX-reel look. 14 hero effects, one at a time, on a
hand-framed camera tour with synced captions.

## Running it

You need the **Modoki Editor** ([download](https://modoki-engine.com)). This project is
not a standalone npm app — the editor supplies the engine, the dev server, and the build
pipeline.

1. Open the editor.
2. **File → Open Project**, and pick this folder.
3. Press **Play** in the toolbar. The camera tour runs on an 84-second loop.

To produce a web build, use **Build → Web** in the editor.

## What's in it

**14 stations**, each ~6 seconds, framed by a hand-authored camera move and named by a
synced caption:

| # | Effect | What it demonstrates |
|---|---|---|
| 1 | Fireball | Layered flipbook flame + additive core + an ember sub-emitter on death |
| 2 | Flame Core | A hot additive plume |
| 3 | Rising Smoke | Soft billboard smoke, slow drift |
| 4 | Nebula | GPU-compute backend — ~60k–100k particles in one draw |
| 5 | Firework | A burst + trailed sparks, repeating on a burst cadence |
| 6 | Energy Jet | A narrow cone with trail-streak particles |
| 7 | Debris | Mesh-mode particles (not billboards) with gravity + bounce |
| 8 | Magic Orb | A pulsing core with orbiting sparkle trails |
| 9 | Black Hole | A `point` attractor pulling a flat particle disk inward |
| 10 | Comet | An orbiting light head dragging a particle trail |
| 11 | Lightsaber | An emissive blade mesh driven by a hand-keyed swing animation |
| 12 | Shockwave | A flat, fast-expanding concentric ring |
| 13 | Lightning | An electric streak crackle |
| 14 | Star Burst | High-density twinkling points |

Underneath the showreel:

- **Engine bloom** — `BloomPostFX`, a reusable WebGPU/TSL whole-scene bloom post-process
  (a real engine feature, not a faked glow sprite). It's what makes additive particles read
  as the only light source in the frame.
- **A `Director`/Timeline tour** — one activation track shows exactly one station at a
  time; a paired signal track drives a single generic `demo.setLabel` UIAction that moves
  the caption to wherever the camera framing leaves room for it.
- **Both particle backends** — CPU/TSL (most effects) and GPU-compute (Nebula, Black
  Hole's disk) — plus trails, a sub-emitter chain (Fireball → embers, Firework → burst →
  sparks), sprite-sheet flipbook animation (Fireball), and mesh-mode particles (Debris).

## The only game code

One `UIAction`, `demo.setLabel`, registered in `runtime/setup.ts` (~35 lines). It sets the
"Now Showing" caption's text **and** its full screen placement (anchor, pivot, edge
insets) from the timeline signal's params, so the label always lands in the open space the
current camera framing leaves. The camera tour, the station sequencing, and every effect's
look are scene/timeline/particle-asset data — none of it is code.

## Concepts worth stealing

- **Bloom as an engine feature, not a shader trick.** `BloomPostFX` is a singleton trait
  any 3D scene can add — it's not specific to this demo.
- **One generic UIAction, many placements.** Rather than hard-coding 14 caption positions
  in code, the *positioning* lives in the timeline's signal-track params; the action just
  applies whatever it's handed. Adding a 15th station needs no code change.
- **Verify particle effects by data, not eye.** Every emitter's `effect` ref, particle
  count, and backend (`simulation:'cpu'|'gpu'`) are visible in scene state — useful for
  confirming a retune actually took effect before trusting the render.

## Assets

Particle sprites are the **Kenney Particle Pack (CC0)** — 17 textures, no other
third-party assets. See [ATTRIBUTION.md](ATTRIBUTION.md).

## Licence

[MIT](LICENSE) — take any of this, including the scene, timeline, and particle defs, and
use it however you like. It is sample code; that is the point.

Note the **engine** itself is licensed separately (Apache-2.0); this licence covers only
the contents of this repository.
