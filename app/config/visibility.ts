"use client";

import { useSyncExternalStore } from "react";

/**
 * Runtime visibility for the toggleable hero elements.
 *
 * `DEFAULTS` is the state on page load — flip one to `true` to show it by
 * default. At runtime, press the "S" key to show/hide all three together
 * (see VisibilityHotkey). Nothing is deleted; it's purely a render switch.
 */
const DEFAULTS = {
  /** Scene 1 scroll-scrubbed envelope animation (+ its "Scroll to open" hint).
   *  When off, the tall scroll section collapses so there's no blank scroll. */
  envelope: false,
  /** The faint gold-foil circle patterns on the left/right behind the page. */
  sideMedallions: false,
  /** The top hero heading: "A manifesto — to build the foundational rails…". */
  manifestoHeading: false
};

export type VisibilityKey = keyof typeof DEFAULTS;

let state: Record<VisibilityKey, boolean> = { ...DEFAULTS };
const listeners = new Set<() => void>();

/** Show all three if any is hidden; hide all three once they're all shown. */
export function toggleAll() {
  const allShown =
    state.envelope && state.sideMedallions && state.manifestoHeading;
  const next = !allShown;
  state = { envelope: next, sideMedallions: next, manifestoHeading: next };
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Subscribe a component to one element's visibility. */
export function useVisible(key: VisibilityKey): boolean {
  return useSyncExternalStore(
    subscribe,
    () => state[key], // client snapshot
    () => DEFAULTS[key] // server snapshot — matches initial client state, no hydration mismatch
  );
}
