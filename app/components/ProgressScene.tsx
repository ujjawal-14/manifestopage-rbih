"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
// The cream sheet unrolls diagonally (bottom-left -> top-right) over the pinned
// hero like a scroll opening, revealing this section. REVEAL_END is the span of
// scrollYProgress the unroll occupies before the content choreography begins.
const REVEAL_END = 0.16;

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

// Diagonal unroll as a clip-path. The covered (revealed) region grows from the
// bottom-left corner out to the top-right. Recomputed per frame from scroll
// progress (no tween between keyframes), so the changing vertex count is fine.
function unrollClip(p: number): string {
  const s = clamp01(p / REVEAL_END);
  if (s <= 0) return "polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%, 0% 100%)";
  if (s >= 1) return "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 100%)";
  const c = 1 - 2 * s; // +1 (edge at bottom-left) -> -1 (edge at top-right)
  const f = (n: number) => `${(n * 100).toFixed(2)}%`;
  if (c >= 0) {
    // a triangle anchored in the bottom-left corner, growing toward the centre
    return `polygon(0% ${f(c)}, ${f(1 - c)} 100%, 0% 100%, 0% 100%, 0% 100%)`;
  }
  // the whole sheet minus the shrinking triangle still uncovered at top-right
  return `polygon(0% 0%, ${f(-c)} 0%, 100% ${f(1 + c)}, 100% 100%, 0% 100%)`;
}

// The midpoint of the leading diagonal edge travels straight along BL -> TR;
// the rolled "tube" sits there as the sheet unrolls behind it.
function rollPos(p: number): { x: number; y: number } {
  const s = clamp01(p / REVEAL_END);
  const c = 1 - 2 * s;
  return { x: (1 - c) / 2, y: (1 + c) / 2 };
}

/**
 * Scene between the manifesto envelope and the postcards.
 *
 * A tall (sceneVh) pinned section laid out on the 24-column Figma grid. As
 * `scrollYProgress` (0 -> 1) advances —
 *
 *   0.00 – 0.36  HIGHLIGHT three key phrases get a light-blue highlighter wipe,
 *                       one per scroll (~3 scrolls), while the text rests centred
 *   then, via a remapped `choreo` progress (0 at 0.36 -> 1 at the end):
 *     SHIFT  the text slides from centre to the first 12 columns and stays put
 *     CARDS  the data cards (last 10 columns) scroll up one full card at a time
 *            — only one visible at a time — until all three have been seen
 *
 * The text is pinned (sticky stage), so it holds while the cards scroll past.
 * Scrolling up reverses everything. Reduced motion: a plain stacked layout
 * (phrases shown statically highlighted).
 */
const HL_END = 0.36; // (in post-reveal progress) where the three highlights finish
const TUNING = { sceneVh: 1180 }; // includes the unroll span + ~one scroll per highlight

type MV = ReturnType<typeof useTransform<number, number>> | number;

// `marks` are 0->1 wipe values (MotionValues when animated, plain numbers when
// static) driving the highlighter width on each phrase via the --hl custom prop.
function StandingText({ marks }: { marks: [MV, MV, MV] }) {
  return (
    <div className="standing-inner">
      <h2 className="standing-title">Where India stands today</h2>
      <p>
        On average, people in our country earn{" "}
        <motion.span className="hl" style={{ "--hl": marks[0] } as React.CSSProperties}>
          about $2,880 a year
        </motion.span>
        . This Per Capita GDP places us at a{" "}
        <motion.span className="hl" style={{ "--hl": marks[1] } as React.CSSProperties}>
          134<sup className="ordinal">th</sup> rank globally
        </motion.span>
        , which is quite low compared to most countries.
      </p>
      <p>
        Even as digital payments grow,{" "}
        <motion.span className="hl" style={{ "--hl": marks[2] } as React.CSSProperties}>
          household credit is still only 41% of GDP.
        </motion.span>{" "}
        That means households still don’t borrow much money compared to the size
        of the economy, much less than in developed countries.
      </p>
      <p>
        We can fix this by creating products that fit seamlessly into the
        everyday lives of Indians.
      </p>
    </div>
  );
}

function BarChart() {
  const bars = [
    { year: "2015", label: "$2.10T", h: 50, cls: "bar--a" },
    { year: "2020", label: "$2.67T", h: 64, cls: "bar--b" },
    { year: "2025", label: "$4.19T", h: 100, cls: "bar--c" },
  ];
  return (
    <div className="bar-chart" role="img" aria-label="India GDP: $2.10T in 2015, $2.67T in 2020, $4.19T in 2025">
      {bars.map((b) => (
        <div className="bar-col" key={b.year}>
          <span className="bar-val">{b.label}</span>
          <div className={`bar ${b.cls}`} style={{ height: `${b.h}%` }} />
          <span className={`bar-year${b.year === "2025" ? " is-now" : ""}`}>
            {b.year}
          </span>
        </div>
      ))}
    </div>
  );
}

function PieChart() {
  return (
    <div className="pie" role="img" aria-label="87 percent">
      <span className="pie-label">87%</span>
    </div>
  );
}

function DotGrid() {
  const cols = 13;
  const rows = 9;
  const dots = [];
  for (let i = 0; i < cols * rows; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    // the tan "all other payment modes" form an L in the bottom-right corner
    const other = row === rows - 1 || (row === rows - 2 && col >= cols - 5);
    dots.push(<span key={i} className={`dot${other ? " dot--other" : ""}`} />);
  }
  return (
    <div className="dot-wrap">
      <div
        className="dot-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        role="img"
        aria-label="Nearly all monthly digital transactions run on UPI; all other payment modes put together are a small fraction"
      >
        {dots}
      </div>
      <span className="dot-note">All other payment modes put together ↘</span>
    </div>
  );
}

const CARDS = [
  {
    key: "gdp",
    chart: <BarChart />,
    caption:
      "In 2025, India became the world’s fourth-largest economy, with a projected GDP of $4.19 trillion.",
  },
  {
    key: "share",
    chart: <PieChart />,
    caption: "87% of Indians now use digital payments.",
  },
  {
    key: "volume",
    chart: <DotGrid />,
    caption:
      "We do nearly 20 billion digital transactions on UPI every single month.",
  },
];

export default function ProgressScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Measure the left text block so the data card can match its height exactly
  // (kept in sync on resize / font load).
  const [cardH, setCardH] = useState(380);
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      setCardH(h);
      // publish for the postcards photo so its rise stops just below this content
      document.documentElement.style.setProperty("--content-h", `${h}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The clip's diagonal edge runs corner-to-corner in % space, so on screen its
  // angle is the viewport's diagonal angle (not 45° unless square). The rolled
  // tube must sit at that same angle or it crosses the edge and a gap shows.
  const [rollAngle, setRollAngle] = useState(33);
  useEffect(() => {
    const calc = () =>
      setRollAngle(
        (Math.atan2(window.innerHeight, window.innerWidth) * 180) / Math.PI,
      );
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  // Phase 0 — the cream sheet unrolls diagonally over the pinned hero. The clip
  // grows from bottom-left to top-right; a rolled "tube" rides the leading edge.
  const clipPath = useTransform(scrollYProgress, unrollClip);
  const rollLeft = useTransform(
    scrollYProgress,
    (p) => `${(rollPos(p).x * 100).toFixed(2)}%`,
  );
  const rollTop = useTransform(
    scrollYProgress,
    (p) => `${(rollPos(p).y * 100).toFixed(2)}%`,
  );
  const rollOpacity = useTransform(
    scrollYProgress,
    [0, 0.004, REVEAL_END * 0.9, REVEAL_END],
    [0, 1, 1, 0],
  );

  // Everything after the unroll runs on `post` (0 during the reveal, then 0->1),
  // so the content choreography only begins once the sheet has covered the screen.
  const post = useTransform(scrollYProgress, [0, REVEAL_END, 1], [0, 0, 1]);

  // Phase 1 — highlight three phrases one per scroll, left-to-right wipes.
  const hl1 = useTransform(post, [0.02, 0.11, 1], [0, 1, 1]);
  const hl2 = useTransform(post, [0.14, 0.23, 1], [0, 1, 1]);
  const hl3 = useTransform(post, [0.26, 0.35, 1], [0, 1, 1]);

  // Phase 2 — after the highlights, `choreo` ramps 0->1 over the rest of the
  // scroll. It's 0 throughout the highlight phase so nothing moves until the
  // wipes are done.
  const choreo = useTransform(post, [0, HL_END, 1], [0, 0, 1]);

  // Text slides from centred (during the highlights) into the left 12-col slot,
  // then stays put. --shift: 1 = centred, 0 = settled left. (Anchored across
  // [0,1] so it doesn't drift during the long card-scroll hold.)
  const shift = useTransform(choreo, [0, 0.18, 1], [1, 0, 0]);

  // The cards column fades in once the text has moved aside.
  const cardsOpacity = useTransform(choreo, [0, 0.1, 0.22, 1], [0, 0, 1, 1]);

  // One card visible at a time: the track steps up exactly one card height per
  // beat (0 -> -100% -> -200%), dwelling on each so each card gets read.
  const trackY = useTransform(
    choreo,
    [0, 0.34, 0.5, 0.66, 0.82, 1],
    ["0%", "0%", "-100%", "-100%", "-200%", "-200%"],
  );

  if (reduce) {
    return (
      <section className="progress-static" aria-label="Where India stands today">
        <StandingText marks={[1, 1, 1]} />
        <h2 className="progress-header">
          And, we are a nation of extraordinary progress—
        </h2>
        <div className="progress-cards-static">
          {CARDS.map((c) => (
            <article className="data-card" key={c.key}>
              <div className="data-card-chart">{c.chart}</div>
              <p className="data-card-caption">{c.caption}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sceneRef}
      className="progress-scene"
      style={{ height: `${TUNING.sceneVh}vh` }}
      aria-label="Where India stands today"
    >
      <div className="progress-sticky">
        {/* the cream sheet + its content, clipped into view as it unrolls */}
        <motion.div
          className="progress-clip"
          style={
            { clipPath, WebkitClipPath: clipPath } as React.CSSProperties
          }
        >
          <div className="progress-paper" aria-hidden="true" />
          <div className="progress-grid">
          <motion.div
            ref={textRef}
            className="progress-text"
            style={{ ["--shift" as string]: shift }}
          >
            <StandingText marks={[hl1, hl2, hl3]} />
          </motion.div>

          <motion.div
            className="progress-cards-col"
            style={{ opacity: cardsOpacity, ["--card-h" as string]: `${cardH}px` }}
          >
            <h2 className="progress-header">
              And, we are a nation of extraordinary progress—
            </h2>
            <div className="cards-viewport">
              <motion.div className="cards-track" style={{ y: trackY }}>
                {CARDS.map((c) => (
                  <div className="card-slot" key={c.key}>
                    <article className="data-card">
                      <div className="data-card-chart">{c.chart}</div>
                      <p className="data-card-caption">{c.caption}</p>
                    </article>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
          </div>
        </motion.div>

        {/* the rolled paper "tube" riding the leading diagonal edge */}
        <motion.div
          className="progress-roll"
          aria-hidden="true"
          style={{
            left: rollLeft,
            top: rollTop,
            opacity: rollOpacity,
            ["--roll-angle" as string]: `${rollAngle}deg`,
          }}
        />
      </div>
    </section>
  );
}
