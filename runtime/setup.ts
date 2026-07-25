/** Game-specific systems + trait registration for this project.
 *
 *  Registers one UIAction, `demo.setLabel`, used by the 3D showcase's Timeline
 *  signal track: each activation-track cue swaps which particle station is
 *  active, and a paired signal marker calls this action (targeting the "Now
 *  Showing" text entity) to update its caption in lockstep.
 */

import { registerUIAction, unregisterUIAction, UIElement, UIAnchor, markUIDirty } from '@modoki/engine/runtime';

const num = (v: unknown, d: number): number => (typeof v === 'number' ? v : d);

export function registerGameSystems(): void {
  // Timeline signal action: set the "Now Showing" caption text AND its full
  // screen placement (anchor + pivot + edge insets), so it lands in the open
  // space the camera framing leaves for the current effect (effect on one side,
  // label on the other — VFX-reel style). The anchor system places the element's
  // top-left at the anchor point, so the PIVOT (0..1) must pull edge/corner
  // anchors back on-screen — the timeline supplies both. Positioning lives in the
  // timeline data (per-station signal params); this action just applies it.
  registerUIAction('demo.setLabel', (ctx) => {
    const p = ctx.params ?? {};
    if (!ctx.target) return;
    const cur = ctx.target.get(UIElement);
    if (!cur) return;
    ctx.target.set(UIElement, {
      ...cur,
      text: (p.text as string) ?? '',
      textAlign: (p.textAlign ?? cur.textAlign) as typeof cur.textAlign,
    });
    const a = ctx.target.get(UIAnchor);
    if (!a) return;
    ctx.target.set(UIAnchor, {
      ...a,
      anchor: (p.anchor ?? a.anchor) as typeof a.anchor,
      pivotX: num(p.pivotX, 0), pivotY: num(p.pivotY, 0),
      top: num(p.top, 0), left: num(p.left, 0),
      right: num(p.right, 0), bottom: num(p.bottom, 0),
    });
    markUIDirty(); // rebuild the UI projection so the renderer picks up text + placement
  });
}

export function unregisterGameSystems(): void {
  unregisterUIAction('demo.setLabel');
}
