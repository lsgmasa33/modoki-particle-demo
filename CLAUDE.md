# particle-demo — dark VFX showreel (particle system showcase)

**A curated, publishable Modoki demo.** It ships as its own public repo, so it stays
self-contained and free of non-CC0 assets. The public-facing doc is
[README.md](README.md); this file is the agent-facing one and travels with the demo.

A near-black studio void where bloom-bright, additive, saturated particle effects are the
hero and the only real light — the Unity/Unreal VFX-reel look (fireballs, nebulae,
explosions, black holes, magic orbs, lightsabers). 14 effects tour one at a time on a
hand-framed camera path with synced captions, driven almost entirely by scene/timeline/
particle-asset data.

## This project
- **Game code is one `UIAction`** — `demo.setLabel`, registered in `runtime/setup.ts`
  (46 lines). The showcase timeline's signal track calls it once per station: it sets the
  "Now Showing" caption's text AND its full screen placement (anchor + pivot + edge
  insets + align) from the marker's params, so the caption lands in whatever open space
  the current camera framing leaves (effect on one side, label on the other). It must call
  `markUIDirty()` after writing the `UIElement`/`UIAnchor` traits directly — that's not
  automatic for a custom `UIAction` (see gotcha below). Positioning lives entirely in the
  timeline data; the action itself is generic and would work for any per-station caption
  layout.
- **Scene** (`runtime/assets/scenes/main.scene.json`, 27 entities) — one scene. A `Main Camera`
  with an `Animator` playing `camera-tour.anim` (loop), an `Ambient Light` + `Sun` turned
  way down, a dark `Floor`, a `Bloom (resource)` singleton (`BloomPostFX`,
  `strength:1.2 radius:0.7 threshold:0`, owner-tuned), a `Director` (entity `Director`)
  driving `showcase.timeline.json`, 13 `ParticleEmitter` entities (mostly parented under
  `Director` for folder organisation, not transform hierarchy — `Comet`/`Lightsaber` are
  siblings with their own `Rotate3D`/`Animator`), and the HUD (`Title`, `Now Showing`
  caption, a `Nav 2D Gallery` button currently **hidden**).
- **Timeline** (`runtime/assets/timelines/showcase.timeline.json`, 84s loop, 6s/station) —
  one **activation** track per effect (shows exactly one station's emitter at a time) plus
  one **signal** track (`Captions`, target `HUD/Now Showing`) whose 14 markers each fire
  `demo.setLabel` with that station's caption text + placement. Station order (matches the
  camera tour's snake path through the "grid", NOT entity creation order): Fireball, Flame
  Core, Rising Smoke, Nebula, Firework, Energy Jet, Debris, Magic Orb, Black Hole, Comet,
  Lightsaber, Shockwave, Lightning, Star Burst.
- **Particle assets** (`runtime/assets/particles/*.particle.json`, 19 files — 14 wired +
  a few earlier iterations) — CPU/TSL backend for most effects, GPU-compute
  (`simulation:'gpu'`, `emission.fillPool`) for Nebula (`gpu-dust-3d`) and the Black Hole
  disk (`vortex-3d`); sub-emitter chains (Fireball → embers on death, Firework →
  burst → sparks trail); mesh-mode particles for Debris (`debris-mesh-3d`, tetra/box, lit,
  gravity+bounce, NOT billboards); sprite-sheet flipbook for the Fireball's flame
  (`flame-flipbook-3d`). All textures are the 17-sprite Kenney Particle Pack (CC0),
  `runtime/assets/textures/particles/`.
- **The Lightsaber is a mesh, not a particle effect** — an emissive cylinder blade
  (`Saber Blade`, `Renderable3DPrimitive`) on a hilt pivot (`Lightsaber` entity), driven by
  a hand-keyed `saber-swing.anim` (`Animator`, loop).
- **2D gallery** (`runtime/assets/scenes/2d-gallery.scene.json`) — a separate scene showing the
  4 original 2D effects (`aligned-jet`/`confetti`/`emit-line`/`smoke`) plus
  `magic-swirl-2d`/`flame-flipbook-2d`. It still loads, but its nav button on the main
  scene's HUD is hidden and it's otherwise unpolished — a deliberate publish-time decision
  (not blocking; ships as-is, just unreachable from the UI). Polishing it into the tour
  is a candidate follow-up, not required.
- **Engine changes made for this demo** (not demo-local — they ship with the engine):
  the `BloomPostFX` trait (`runtime/traits/BloomPostFX.ts`) with its WebGPU/TSL
  whole-scene bloom implementation in `runtime/rendering/postfx/PostFXStack.ts`, wired
  into `Scene3D`'s render branch, and a `meshParticles.ts` primitive-tessellation bump
  (torus 8×16 → 16×80 + thinner tube; sphere/cone up) so mesh-mode particles (Debris)
  aren't visibly faceted. Both are documented in `docs/rendering.md` / the engine's trait
  docs, not here.

## Gotchas (cost real debugging time here)
- **`markUIDirty()` is NOT automatic for a custom `UIAction` that writes a UI trait
  directly.** `demo.setLabel` calls it explicitly after `set(UIElement, …)` /
  `set(UIAnchor, …)` — omit it and the DATA updates (visible in `modoki_get_scene_state`)
  but the DOM never repaints. Data-correct ≠ pixels-correct.
- **`Director.time` / `Animator.time` are SERIALIZED** (only `lastTime`/`started`/
  `activeClip` are runtime-only). Scrubbing or playing then saving bakes the playhead into
  the scene file — both must read `0` before a save, or a fresh load starts mid-loop
  instead of at station 1. Check both the `Director` entity and `Main Camera`'s `Animator`
  before publishing.
- **Station order is a "snake" through the authored layout, NOT entity creation order** —
  the timeline's activation tracks and the camera tour's keyframes are hand-matched to
  that path. Repositioning or adding a station means recomputing both together, not just
  one.
- **A sub-emitter's `maxParticles` needs headroom** — overlapping bursts (Firework's
  burst→sparks chain) can exceed a tight pool and silently drop particles (a
  `[particles] sub-emitter … burst exceeded its pool` console warning, not a crash). Check
  the console if a burst effect looks thinner than expected.
- **Round-trip MCP latency vs. a looping Director/Animator** — `modoki_capture_viewport`
  round-trips take seconds the tour doesn't wait for. Read `Director.time`/
  `Animator.time` from `modoki_get_scene_state` to know which station you actually landed
  on; don't infer it from wall-clock sleeps between calls.
- **A believed-reliable human repro over your own tooling** — the original
  `isActive`-on-particles engine bug ("I see all particles all the time") surfaced exactly
  this way; a report that contradicts your own check is a reason to re-check the tool, not
  dismiss the report.

## Identity & build
- appId `com.modokiengine.particledemo`, appName "Particle Demo".
- **Native iOS + Android are committed here** (same arrangement as `demos/2d-physics-demo`):
  the folders live in the private repo, and `scripts/publish-demo.sh` **drops them from the
  public snapshot**, so the published demo is still web-only. (This entry used to say
  "web-only, no `ios/`/`android/` folders, and none should be added" — that is no longer the
  rule for this demo.)
- **iOS signing is a per-machine setting, not a repo one.** `build.appleTeamId` is a private
  build field: the committed `project.config.json` always holds `""`, and a real Team ID
  lives only in the gitignored `project.user.json`. So a fresh clone has none and iOS
  signing fails until you set one in **Project Settings → iOS → Signing**. Reading the
  committed file tells you nothing about whether anyone has signed this demo.
- Build/run: open in the Modoki Editor (**File → Open Project**), then **Build → Web**, or
  `MODOKI_PROJECT=demos/particle-demo npm run build -- --target web` from the repo root.
- **Bloom is NOT WebGPU-only — it renders on the WebGL2 fallback too.** (This entry used to
  claim the fallback loses the glow. Wrong: `createRenderer` always builds a `WebGPURenderer`,
  three swaps in a WebGL2 *backend* inside that class, and the post-FX gate keys on the renderer
  CLASS — so the stack still runs. Verified against `Scene3D.tsx` / `postfx/stackPlan.ts`; only
  FXAA is dropped on that backend.) Engine reference: `docs/rendering.md` § Post-FX stack.

## Driving this project

This is a **Modoki** project — a Claude-friendly game engine where you, Claude, author
scene data, game logic, and asset wiring, while a human directs and reviews in the visual
editor. Open this folder in the Modoki Editor, then **AI → Connect Claude Code** wires an
`.mcp.json` for it — once connected, the editor exposes MCP tools that read and mutate the
*live* running project. Prefer them over screenshots: they prove an edit actually took
effect, not just that the file changed.

**Observe the running game — don't infer it from source.** `setup.ts`/the scene/timeline
JSON tell you what this project is *designed* to do, not what it's doing right now — which
station is active, whether a burst fired, what the caption currently reads. If you're
answering "did it work / why does it look wrong" from a file read, that's a guess; call
`modoki_get_scene_state` and cite what it returned.

**The verification loop:** read live state (`modoki_get_scene_state`) → mutate
(`modoki_mutate_scene`) → verify the DATA again (cheap, deterministic, tolerance not
`===`) → verify PIXELS (`modoki_capture_viewport`, or CDP `Page.captureScreenshot` for the
TRUE framebuffer — `capture_viewport` forces a render and can mask a stale-frame bug) only
when you need to see the render itself. Never hand-write scene/timeline JSON; every asset
ref is a GUID from `modoki_list_assets`, not a literal path.

Modoki names its two tool families:
- **Percept** — verify by data, not vibes: `modoki_get_scene_state` (station/timeline/
  bloom state), `modoki_diagnose` (NaN transforms, broken refs), `modoki_watch` (a live
  time-series — useful for confirming `Director.time` is actually advancing).
- **Enact** — trusted input, like a human tester: `modoki_play_control` (play/stop/pause/
  step), `modoki_set_playhead` for the Animation Editor, `modoki_tap`/`drag`/`hover`
  aimed by CSS `selector` or `x,y`.

This project's gotchas section above records the project-specific traps (UI dirty-flag,
serialized playheads, station ordering) — check there before re-deriving a fix from
scratch. The full tool catalog, conventions, and engine concepts:
**https://modoki-engine.com**.
