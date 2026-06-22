"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";

/**
 * Scene 2 — two stacked postcards that swap on scroll.
 *
 * A tall (sceneVh) section with a sticky 100vh stage: once the stack is pinned
 * dead-centre, scrolling drives `scrollYProgress` (0 -> 1) so that —
 *
 *   0.00 – 0.45  HOLD   the stack rests centred (front card on top) for ~one
 *                       screen of scroll, so there's time to read it before it
 *                       moves — the swap never starts until it's settled centre
 *   0.45 – 0.90  SHUFFLE the front (top) card lifts straight up first, then arcs
 *                       back DOWN and tucks behind the other card into its
 *                       offset resting spot — like dealing the top card to the
 *                       bottom of the deck. Meanwhile the back card slides up
 *                       from its offset into the centred front spot. The cards
 *                       swap roles; neither leaves the scene.
 *   0.90 – 1.00  HOLD   rests on the new front card, then holds for two extra
 *                       viewports (EXTRA_HOLD_VH) so the revealed bottom card
 *                       lingers on screen before the scene scrolls up away
 *
 * Scrolling up reverses it. Grey placeholders for now.
 */
const STICKY_VH = 100; // height of the pinned stage
const EXTRA_HOLD_VH = 200; // two extra viewports of stillness AFTER the shuffle, so the new front card lingers before the scene moves up

const TUNING = {
  sceneVh: 440, // total scroll length: read-hold + shuffle + buffer + 200vh extra hold
  swap: { startAt: 0.45, midAt: 0.675, endAt: 0.9 }, // midAt = apex of the lift
};

// Deterministic pseudo-random in [0,1): stable across SSR/CSR (no Math.random).
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const VB_W = 1200;
const VB_H = 240;
const EDGE_POINTS = 64;
const LIP = 10; // how far the bright fibre rim pokes past the cream edge (viewBox units)

// Organic tear height at sample i: a gentle low-frequency undulation + a finer
// ripple + small fibre noise — soft and irregular, no sharp teeth. `side` only
// shifts the phase so the top and bottom edges look different.
function edgeY(side: "top" | "bottom", i: number): number {
  const t = i / EDGE_POINTS;
  const s = i * 1.7 + (side === "top" ? 0 : 700);
  return (
    VB_H * 0.5 +
    Math.sin(t * Math.PI * 2 * 2.3 + (side === "top" ? 0.6 : 2.1)) * 24 +
    Math.sin(t * Math.PI * 2 * 5.7 + 1.2) * 10 +
    (rand(s) - 0.5) * 9
  );
}

// Smooth curve through points using midpoint quadratics (C1-continuous) so the
// torn edge reads as soft paper rather than a jagged polyline.
function smooth(pts: [number, number][]): string {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const xc = (pts[i][0] + pts[i + 1][0]) / 2;
    const yc = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${pts[i][0]} ${pts[i][1]} ${xc.toFixed(1)} ${yc.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L${last[0]} ${last[1]}`;
  return d;
}

// SVG mask (white = paper kept). `side:"top"` keeps the upper region (torn along
// the bottom); "bottom" keeps the lower region (torn along the top). When `lip`
// is set, the edge is nudged a little further into the reveal (+ extra wobble)
// so a thin bright fibre rim shows past the cream paper.
function tornMask(side: "top" | "bottom", lip: boolean): string {
  const dir = side === "top" ? 1 : -1; // reveal direction (+y = downward)
  const pts: [number, number][] = [];
  for (let i = 0; i <= EDGE_POINTS; i++) {
    const x = (i / EDGE_POINTS) * VB_W;
    let y = edgeY(side, i);
    if (lip) {
      y += dir * LIP + (rand(i * 2.3 + (side === "top" ? 50 : 760)) - 0.5) * 5;
    }
    y = Math.max(8, Math.min(VB_H - 8, y));
    pts.push([+x.toFixed(1), +y.toFixed(1)]);
  }
  const edge = smooth(pts);
  const d =
    side === "top"
      ? `${edge} L${VB_W} 0 L0 0 Z`
      : `${edge} L${VB_W} ${VB_H} L0 ${VB_H} Z`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${VB_W} ${VB_H}' preserveAspectRatio='none'><path d='${d}' fill='#fff'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const TOP_MASK = tornMask("top", false);
const TOP_LIP_MASK = tornMask("top", true);
const BOTTOM_MASK = tornMask("bottom", false);
const BOTTOM_LIP_MASK = tornMask("bottom", true);

// Copy printed on the right half of the first (front) postcard.
function FrontCopy() {
  return (
    <div className="postcard-copy">
      <p>
        But enabling growth is only half the task. It must also preserve and
        protect by anticipating fraud, managing risk in real time, and scaling
        securely.
      </p>
      <p>
        The foundations of our financial system must enable us to move beyond
        one-size-fits-all products, and harness technology to meet India’s
        unique needs.
      </p>
    </div>
  );
}

// Copy printed on the right half of the second (back) postcard.
function BackCopy() {
  return (
    <div className="postcard-copy">
      <p>
        At a national scale, India’s credit assessment, fraud detection and
        payments intelligence platforms must be able to process tens of
        thousands of transactions every second to deliver instant credit
        decisions and fraud scores with near-zero tolerance for error.
        Our platforms must be built to work flawlessly at a national scale,
        while earning the trust of regulators, innovators, and millions of
        everyday Indians who rely on them. Through this process, we ensure that
        India’s financial foundations are secure, AI-enabled, frictionless, and
        empathetic.
      </p>
    </div>
  );
}

function useViewportHeight() {
  const [h, setH] = useState(900); // SSR / first-paint default
  useEffect(() => {
    const update = () => setH(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return h;
}

export default function PostcardsScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const vh = useViewportHeight();

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  // Play the whole shuffle over the front portion of the scroll, then hold at
  // its end state for two extra viewports (EXTRA_HOLD_VH) before the scene
  // releases and scrolls up — so the new front card lingers. All swap fractions
  // below are expressed against this remapped `progress`, pacing unchanged.
  const scrubVh = TUNING.sceneVh - STICKY_VH;
  const chorEnd = (scrubVh - EXTRA_HOLD_VH) / scrubVh;
  const progress = useTransform(scrollYProgress, [0, chorEnd, 1], [0, 1, 1]);

  const { startAt: s, midAt: m, endAt: e } = TUNING.swap;

  // Front (top) card shuffles: lifts straight up to an apex (s -> m), then arcs
  // back DOWN and tucks behind the other card into its offset resting spot
  // (m -> e) — dealing the top card to the bottom of the deck, never leaving.
  const frontY = useTransform(progress, [0, s, m, e, 1], [0, 0, -vh * 0.4, 16, 16]);
  const frontX = useTransform(progress, [0, s, m, e, 1], [0, 0, 0, -18, -18]);
  const frontRotate = useTransform(progress, [0, s, m, e, 1], [2.5, 2.5, 1, -4, -4]);
  const frontScale = useTransform(progress, [0, s, m, e, 1], [1, 1, 1.04, 0.96, 0.96]);
  // Drop the front card behind the back card at the apex, so the descent reads
  // as it sliding underneath. (Back card sits at z-index 1; front goes 2 -> 0.)
  const frontZ = useTransform(progress, (v) => (v < m ? 2 : 0));

  // Back (bottom) card: once the front has lifted clear, slides up from its
  // offset into the centred front spot and becomes the new top card.
  const backX = useTransform(progress, [0, m, e, 1], [-18, -18, 0, 0]);
  const backY = useTransform(progress, [0, m, e, 1], [16, 16, 0, 0]);
  const backRotate = useTransform(progress, [0, m, e, 1], [-4, -4, 0, 0]);
  const backScale = useTransform(progress, [0, m, e, 1], [0.96, 0.96, 1, 1]);

  // Reduced motion: a plain, static stack — CSS transforms give the offset look.
  if (reduce) {
    return (
      <section className="postcards-static" aria-label="Postcards">
        <p className="postcards-statement">
          What India needs is a financial system that is flexible in design
          <br />
          and deeply woven into the flows of everyday life.
        </p>
        <div className="postcard-stack">
          <div className="postcard postcard--back">
            <div className="postcard-face" />
            <span className="postcard-stamp" aria-hidden="true" />
            <BackCopy />
          </div>
          <div className="postcard postcard--front">
            <div className="postcard-face" />
            <span className="postcard-stamp" aria-hidden="true" />
            <FrontCopy />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sceneRef}
      className="postcards-scene"
      style={{ height: `${TUNING.sceneVh}vh` }}
      aria-label="Postcards"
    >
      {/* tall photo backdrop that overflows into the neighbouring sections so
          the ripped edges live out in the data section / the section below */}
      <div className="postcards-photo" aria-hidden="true" />

      <div className="postcards-sticky">
        {/* persistent header — stays above the stack through the whole swap */}
        <p className="postcards-statement">
          What India needs is a financial system that is flexible in design
          <br />
          and deeply woven into the flows of everyday life.
        </p>

        <div className="postcard-stack">
          <motion.div
            className="postcard postcard--back"
            style={{
              x: backX,
              y: backY,
              rotate: backRotate,
              scale: backScale,
              zIndex: 1,
            }}
          >
            <div className="postcard-face" />
            <span className="postcard-stamp" aria-hidden="true" />
            <div
              className="postcard-image"
              aria-hidden="true"
              style={{ ["--postcard-img" as string]: "url(/postcard-desk.png)" }}
            >
              <div className="postcard-image-inner" />
            </div>
            <BackCopy />
          </motion.div>
          <motion.div
            className="postcard postcard--front"
            style={{ x: frontX, y: frontY, rotate: frontRotate, scale: frontScale, zIndex: frontZ }}
          >
            <div className="postcard-face" />
            <span className="postcard-stamp" aria-hidden="true" />
            <div
              className="postcard-image"
              aria-hidden="true"
              style={{ ["--postcard-img" as string]: "url(/postcard-money.png)" }}
            >
              <div className="postcard-image-inner" />
            </div>
            <FrontCopy />
          </motion.div>
        </div>
      </div>

      {/* ripped-paper bands at the section's top & bottom seams (NOT pinned):
          they scroll past as you enter/leave, so when the scene is centred the
          torn edges sit off-screen and the photo fills the viewport. Each side
          has a bright fibre-rim layer behind the cream paper. */}
      <div
        className="paper-tear paper-tear--lip paper-tear--top"
        aria-hidden="true"
        style={{ WebkitMaskImage: TOP_LIP_MASK, maskImage: TOP_LIP_MASK }}
      />
      <div
        className="paper-tear paper-tear--cream paper-tear--top"
        aria-hidden="true"
        style={{ WebkitMaskImage: TOP_MASK, maskImage: TOP_MASK }}
      />
      <div
        className="paper-tear paper-tear--lip paper-tear--bottom"
        aria-hidden="true"
        style={{ WebkitMaskImage: BOTTOM_LIP_MASK, maskImage: BOTTOM_LIP_MASK }}
      />
      <div
        className="paper-tear paper-tear--cream paper-tear--bottom"
        aria-hidden="true"
        style={{ WebkitMaskImage: BOTTOM_MASK, maskImage: BOTTOM_MASK }}
      />
    </section>
  );
}
