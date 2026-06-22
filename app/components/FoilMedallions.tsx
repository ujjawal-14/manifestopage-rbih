"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { GUILLOCHE_PATHS, GUILLOCHE_VIEWBOX } from "./guillochePaths";

/**
 * Two intricate guilloche medallions (banknote-style woven spirograph rings,
 * imported from Asset 2.svg), each anchored on an edge of the viewport so only
 * a semicircle pokes onto the screen:
 *   - left-center:  centre sits on the left edge   -> right half visible
 *   - right-center: centre sits on the right edge  -> left half visible
 * Both rotate as the page scrolls (and so spin backwards as you scroll up).
 *
 * The source artwork ships a different rainbow gradient per ring; here every
 * ring is stroked with a single metallic-gold gradient so the foil reads as
 * one piece of gold, matching the seal emboss elsewhere on the page.
 */
const SIZE = 760; // px diameter of each medallion's on-screen footprint
// How far to slide a medallion sideways to clear the screen: a touch more than
// its visible half (SIZE/2), so it's fully gone by the end of the slide.
const SLIDE_OUT = SIZE * 0.62;

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

type MV = ReturnType<typeof useTransform<number, number>> | number;

function Medallion({
  id,
  rotate,
  scale,
  slideX,
  opacity,
  wrapperStyle,
}: {
  id: string;
  rotate: MV;
  scale: MV;
  slideX: MV;
  opacity: MV;
  wrapperStyle: React.CSSProperties;
}) {
  const grad = `${id}-gold`;

  return (
    <motion.div
      className="foil-medallion-wrap"
      style={{ ...wrapperStyle, x: slideX }}
    >
      <motion.svg
        className="foil-medallion"
        width={SIZE}
        height={SIZE}
        viewBox={GUILLOCHE_VIEWBOX}
        style={{ rotate, scale }}
        aria-hidden="true"
      >
        <defs>
          {/* metallic gold: dark -> bright highlight bands -> dark, matching the
              --gold-foil gradient used on the seal emboss, so the foil reads as
              real metal catching light */}
          <linearGradient id={grad} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6f5018" />
            <stop offset="14%" stopColor="#b1842c" />
            <stop offset="30%" stopColor="#f7e7a6" />
            <stop offset="44%" stopColor="#d8b14e" />
            <stop offset="56%" stopColor="#fff6d8" />
            <stop offset="70%" stopColor="#cda23c" />
            <stop offset="86%" stopColor="#9a721f" />
            <stop offset="100%" stopColor="#6f5018" />
          </linearGradient>
        </defs>

        <motion.g
          fill="none"
          stroke={`url(#${grad})`}
          strokeWidth="0.65"
          strokeMiterlimit="10"
          style={{ opacity }}
        >
          {GUILLOCHE_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </motion.g>
      </motion.svg>
    </motion.div>
  );
}

export default function FoilMedallions() {
  const reduce = useReducedMotion();
  const vh = useViewportHeight();
  const { scrollY, scrollYProgress } = useScroll();

  // Rotate with scroll; spins backwards when scrolling up. Anchored across the
  // full [0,1] range so the value never drifts during sticky/hold phases.
  const leftSpin = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const rightSpin = useTransform(scrollYProgress, [0, 1], [0, -260]);

  // Size: large + slightly overlapping over the envelope hero, easing down to
  // normal size by the time the data cards arrive (~37% down the page), then
  // holding at normal for the rest of the page. Anchored across [0,1].
  const sizeScale = useTransform(scrollYProgress, [0, 0.37, 1], [1.9, 1, 1]);

  // Slide the medallions off-screen (left one left, right one right) exactly as
  // the data cards fan apart in ProgressScene. The spread runs over that scene's
  // `choreo` 0.66 -> 0.88, and choreo only begins after its highlight phase
  // (HL_END 0.36) — so in the scene's raw progress the spread sits at
  // HL_END + frac*(1 - HL_END). ProgressScene starts right after EnvelopeScene.
  // (Kept in sync with EnvelopeScene/ProgressScene TUNING — update if those
  // scene heights, HL_END, or the SPREAD window change.)
  const ENV_VP = 4.4; // EnvelopeScene is 440vh tall
  const PROG_SCRUB_VP = 8.4; // ProgressScene scrubs 840vh (940 - 100vh sticky)
  const HL_END = 0.36; // ProgressScene highlight phase ends here
  const spreadProgStart = HL_END + 0.66 * (1 - HL_END); // ~0.782 of the scene
  const spreadProgEnd = HL_END + 0.88 * (1 - HL_END); // ~0.923 of the scene
  const spreadStart = (ENV_VP + spreadProgStart * PROG_SCRUB_VP) * vh; // ~10.97vp
  const spreadEnd = (ENV_VP + spreadProgEnd * PROG_SCRUB_VP) * vh; // ~12.16vp
  const slideRange = [0, spreadStart, spreadEnd, spreadEnd + 20 * vh];
  const leftSlide = useTransform(scrollY, slideRange, [0, 0, -SLIDE_OUT, -SLIDE_OUT]);
  const rightSlide = useTransform(scrollY, slideRange, [0, 0, SLIDE_OUT, SLIDE_OUT]);

  // Faint (0.15) until the envelope flap opens, then up to full (0.35). The flap
  // opens over EnvelopeScene's remapped progress 0.3 -> 0.52; with the scene
  // scrubbing 3.4vp and chorEnd ~0.706, that's ~0.72vp -> ~1.25vp of page scroll.
  const flapStart = 0.72 * vh;
  const flapOpen = 1.25 * vh;
  const medOpacity = useTransform(
    scrollY,
    [0, flapStart, flapOpen, flapOpen + 50 * vh],
    [0.15, 0.15, 0.35, 0.35],
  );

  return (
    <div className="foil-medallions" aria-hidden="true">
      {/* left-center: centre pinned to the left edge -> only right half shows */}
      <Medallion
        id="med-left"
        rotate={reduce ? 0 : leftSpin}
        scale={reduce ? 1 : sizeScale}
        slideX={reduce ? 0 : leftSlide}
        opacity={reduce ? 0.35 : medOpacity}
        wrapperStyle={{
          position: "absolute",
          top: "50%",
          left: -SIZE / 2,
          marginTop: -SIZE / 2,
        }}
      />
      {/* right-center: centre pinned to the right edge -> only left half shows */}
      <Medallion
        id="med-right"
        rotate={reduce ? 0 : rightSpin}
        scale={reduce ? 1 : sizeScale}
        slideX={reduce ? 0 : rightSlide}
        opacity={reduce ? 0.35 : medOpacity}
        wrapperStyle={{
          position: "absolute",
          top: "50%",
          right: -SIZE / 2,
          marginTop: -SIZE / 2,
        }}
      />
    </div>
  );
}
