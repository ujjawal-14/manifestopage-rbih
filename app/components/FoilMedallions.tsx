"use client";

import { useMemo } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * Two intricate circular gold-foil guilloche medallions, each anchored on an
 * edge of the viewport so only a semicircle pokes onto the screen:
 *   - left-center:  centre sits on the left edge   -> right half visible
 *   - right-center: centre sits on the right edge  -> left half visible
 * Both rotate as the page scrolls (and so spin backwards as you scroll up).
 */
const SIZE = 760; // px diameter of each medallion's own drawing space
const C = SIZE / 2;

// Concentric guilloche rings: each ring's radius is sinusoidally modulated and
// its phase advances per ring, weaving successive rings into the interlaced
// spiral you see on banknotes / certificate seals.
function buildRings() {
  const paths: string[] = [];
  const rings = 40;
  const steps = 260;
  const rMin = 26;
  const rMax = C - 10;
  const n1 = 14; // primary lobe count
  const n2 = 6; // secondary harmonic for richness
  for (let k = 0; k < rings; k++) {
    const f = k / (rings - 1);
    const R = rMin + (rMax - rMin) * f;
    const phi = k * 0.26; // phase advances per ring -> woven spiral
    const a1 = 4 + 11 * f; // lobes deepen toward the rim
    const a2 = 3;
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const th = (i / steps) * Math.PI * 2;
      const r =
        R + a1 * Math.sin(n1 * th + phi) + a2 * Math.sin(n2 * th - phi * 0.6);
      const x = C + r * Math.cos(th);
      const y = C + r * Math.sin(th);
      d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    paths.push(`${d.trim()} Z`);
  }
  return paths;
}

// A hypotrochoid (spirograph) rose for the intricate interlaced core.
function buildSpiro(Rr: number, rr: number, d: number, scale: number) {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const turns = rr / gcd(Rr, rr);
  const steps = Math.round(turns * 160);
  const k = (Rr - rr) / rr;
  let str = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * turns;
    const x = C + scale * ((Rr - rr) * Math.cos(t) + d * Math.cos(k * t));
    const y = C + scale * ((Rr - rr) * Math.sin(t) - d * Math.sin(k * t));
    str += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return str.trim();
}

function Medallion({
  id,
  rotate,
  wrapperStyle,
}: {
  id: string;
  rotate: ReturnType<typeof useTransform<number, number>> | number;
  wrapperStyle: React.CSSProperties;
}) {
  const rings = useMemo(() => buildRings(), []);
  const spiroA = useMemo(() => buildSpiro(8, 5, 5, (C - 30) / 13), []);
  const spiroB = useMemo(() => buildSpiro(7, 3, 4, (C - 90) / 8), []);
  const grad = `${id}-gold`;

  return (
    <div className="foil-medallion-wrap" style={wrapperStyle}>
    <motion.svg
      className="foil-medallion"
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{ rotate }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={grad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7a5a1c" />
          <stop offset="22%" stopColor="#caa14e" />
          <stop offset="45%" stopColor="#fff0bf" />
          <stop offset="60%" stopColor="#e8c879" />
          <stop offset="80%" stopColor="#b8923f" />
          <stop offset="100%" stopColor="#8a6a24" />
        </linearGradient>
      </defs>

      <g
        fill="none"
        stroke={`url(#${grad})`}
        strokeWidth="1"
        opacity="0.3"
      >
        {/* outer rim circles */}
        <circle cx={C} cy={C} r={C - 6} strokeWidth="2.5" />
        <circle cx={C} cy={C} r={C - 16} strokeWidth="1.2" />
        {/* woven concentric guilloche rings */}
        {rings.map((d, i) => (
          <path key={i} d={d} />
        ))}
        {/* spirograph rosette core */}
        <path d={spiroA} strokeWidth="0.9" opacity="0.9" />
        <path d={spiroB} strokeWidth="0.9" opacity="0.9" />
        <circle cx={C} cy={C} r="22" strokeWidth="1.4" />
      </g>
    </motion.svg>
    </div>
  );
}

export default function FoilMedallions() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Rotate with scroll; spins backwards when scrolling up. Anchored across the
  // full [0,1] range so the value never drifts during sticky/hold phases.
  const leftSpin = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const rightSpin = useTransform(scrollYProgress, [0, 1], [0, -260]);

  return (
    <div className="foil-medallions" aria-hidden="true">
      {/* left-center: centre pinned to the left edge -> only right half shows */}
      <Medallion
        id="med-left"
        rotate={reduce ? 0 : leftSpin}
        wrapperStyle={{
          position: "absolute",
          top: "50%",
          left: -C,
          marginTop: -C,
        }}
      />
      {/* right-center: centre pinned to the right edge -> only left half shows */}
      <Medallion
        id="med-right"
        rotate={reduce ? 0 : rightSpin}
        wrapperStyle={{
          position: "absolute",
          top: "50%",
          right: -C,
          marginTop: -C,
        }}
      />
    </div>
  );
}
