"use client";

import { useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";

/**
 * Gold-foil guilloche background. A dim gold radial rosette (concentric
 * modulated rings) fills the viewport; a holographic (gold -> green -> pink)
 * shine sits only on the left
 * and right edges, masked by the pattern so the lines themselves glint, and
 * rides vertically with scroll (up as you scroll up).
 */
const W = 1440;
const H = 900;

function buildGuilloche() {
  // Radial rosette: concentric rings whose radius is sinusoidally modulated,
  // with the phase advancing per ring so successive rings interleave into the
  // woven spiral you see on banknote/certificate guilloche.
  const paths: string[] = [];
  const cx = W / 2;
  const cy = H / 2;
  const rings = 46;
  const steps = 200; // points per ring
  const rMin = 24;
  const rMax = 920; // reaches the corners (~849 from centre) so it fills the viewport
  const n1 = 16; // primary lobe count
  const n2 = 5; // secondary harmonic for richness
  for (let k = 0; k < rings; k++) {
    const f = k / (rings - 1);
    const R = rMin + (rMax - rMin) * f;
    const phi = k * 0.22; // phase advances per ring -> woven spiral
    const a1 = 6 + 14 * f; // lobes deepen toward the outer rings
    const a2 = 4;
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const th = (i / steps) * Math.PI * 2;
      const r =
        R + a1 * Math.sin(n1 * th + phi) + a2 * Math.sin(n2 * th - phi * 0.7);
      const x = cx + r * Math.cos(th);
      const y = cy + r * Math.sin(th);
      d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    paths.push(`${d.trim()} Z`);
  }
  return paths;
}

export default function FoilBackground() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const paths = useMemo(() => buildGuilloche(), []);

  // Shine rides up as you scroll up: highest at the top (progress 0), lower as
  // you scroll down. Range is in SVG user units.
  const shineYMotion = useTransform(scrollYProgress, [0, 1], [-200, 200]);
  const shineY = reduce ? 0 : shineYMotion;

  return (
    <svg
      className="foil"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <mask
          id="foilMask"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={W}
          height={H}
        >
          <g fill="none" stroke="#fff" strokeWidth="1.6">
            {paths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </mask>
        <radialGradient id="foilShine">
          <stop offset="0%" stopColor="#fff3c4" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#d6ffcf" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#ffe2a0" stopOpacity="0.45" />
          <stop offset="72%" stopColor="#ffc9e6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* base: dim gold guilloche, always visible */}
      <g className="foil-base" fill="none" stroke="#b8923f" strokeWidth="1">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* holographic shine, clipped to the pattern lines, moving with scroll */}
      <g mask="url(#foilMask)">
        <motion.g style={{ y: shineY }}>
          <ellipse cx="0" cy={H / 2} rx="560" ry="380" fill="url(#foilShine)" />
          <ellipse cx={W} cy={H / 2} rx="560" ry="380" fill="url(#foilShine)" />
        </motion.g>
      </g>
    </svg>
  );
}
