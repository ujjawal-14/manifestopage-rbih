/**
 * Organic torn-paper edge as a CSS mask-image (SVG data URI), shared by the
 * hero and the postcards section. `preserveAspectRatio="none"` stretches the
 * viewBox to whatever element it masks, so one mask works at any width.
 *
 *   tornMask("bottom") — keeps the LOWER region (torn edge along the top):
 *     a cream band masked with it shows paper below the tear, clear above.
 *   tornMask("top")    — keeps the UPPER region (torn edge along the bottom).
 */
const VB_W = 1200;
const VB_H = 240;
const EDGE_POINTS = 64;

// deterministic pseudo-random in [0,1) — stable across SSR/CSR (no Math.random)
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// soft, irregular tear height at sample i (low-frequency undulation + ripple + fibre noise)
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

// midpoint-quadratic smoothing so the edge reads as soft paper, not a polyline
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

function tornMask(side: "top" | "bottom"): string {
  const pts: [number, number][] = [];
  for (let i = 0; i <= EDGE_POINTS; i++) {
    const x = (i / EDGE_POINTS) * VB_W;
    const y = Math.max(8, Math.min(VB_H - 8, edgeY(side, i)));
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

export const BOTTOM_TEAR = tornMask("bottom");
export const TOP_TEAR = tornMask("top");
