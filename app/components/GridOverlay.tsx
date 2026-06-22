"use client";

import { useEffect, useState } from "react";

/**
 * Figma-style 24-column layout grid overlay.
 *
 * Mirrors the Figma layout grid one-to-one:
 *   count 24 · type "stretch" · frame 1920 · margin 300 · gutter 16
 *
 * The frame is `min(1920px, 100vw)` centred in the viewport: at 1920+ it's
 * pixel-exact to the Figma frame (centred, with 300px margins), and below
 * 1920 the margin and gutter scale as the same fractions of the frame, so the
 * whole grid shrinks proportionally to fit smaller screens without overflow.
 *
 * Toggle with the "G" key. Nothing renders until you press it, and it never
 * intercepts clicks, so it's safe to leave mounted while you work.
 */
const COLUMNS = 24;
const FRAME = 1920; // Figma frame width
const MARGIN = 300; // side margin (each side)
const GUTTER = 16; // gutter between columns

export default function GridOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "g") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // ignore while typing in a field
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
      ) {
        return;
      }
      setVisible((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!visible) return null;

  return (
    <div aria-hidden className="grid-overlay">
      <div
        className="grid-overlay-frame"
        style={{
          // frame width caps at 1920 and shrinks with the viewport below it;
          // margin + gutter are kept as fractions of the frame so everything
          // scales together (pixel-exact at 1920, proportional below).
          ["--grid-frame" as string]: `min(${FRAME}px, 100vw)`,
          width: "var(--grid-frame)",
          padding: `0 calc(var(--grid-frame) * ${MARGIN / FRAME})`,
          gap: `calc(var(--grid-frame) * ${GUTTER / FRAME})`,
          gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`
        }}
      >
        {Array.from({ length: COLUMNS }).map((_, i) => (
          <span key={i} className="grid-overlay-col" />
        ))}
      </div>
    </div>
  );
}
