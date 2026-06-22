"use client";

import { useEffect } from "react";
import { toggleAll } from "../config/visibility";

/**
 * Press "S" to show/hide the toggleable hero elements (envelope, side
 * medallions, manifesto heading) all at once. Renders nothing.
 */
export default function VisibilityHotkey() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "s") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // ignore while typing in a field
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
      ) {
        return;
      }
      toggleAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
