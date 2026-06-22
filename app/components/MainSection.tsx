"use client";

import { useEffect, useRef } from "react";
import { useScroll, useMotionValueEvent } from "motion/react";

/**
 * Main hero — a scroll-scrubbed video with the manifesto on top. The video
 * doesn't autoplay; its frame follows scroll, so it only advances as the user
 * scrolls. To keep it smooth, the target time is tracked from scroll but the
 * video's currentTime is eased toward it in a rAF loop (so it glides between
 * frames instead of hard-seeking on every scroll tick).
 *
 * Tweak these to taste:
 */
const MANIFESTO_LINE_1 = "A manifesto—to build the foundational";
const MANIFESTO_LINE_2 = "rails of India’s financial future.";
const TOP_POSITION = 300; // px the text sits from the top of the section
const TEXT_SIZE = 45; // px font size of the manifesto text
const SCRUB_VIEWPORTS = 1.4; // the video plays across this many viewports of scroll
const EASE = 0.12; // 0–1; lower = smoother/laggier glide toward the scroll target

export default function MainSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTime = useRef(0); // where scroll wants the video
  const { scrollY } = useScroll();

  // scroll only updates the *target* time; the rAF loop below eases toward it
  useMotionValueEvent(scrollY, "change", (y) => {
    const v = videoRef.current;
    if (!v || !v.duration || !isFinite(v.duration)) return;
    const range = window.innerHeight * SCRUB_VIEWPORTS;
    const p = Math.min(1, Math.max(0, y / range));
    targetTime.current = p * v.duration;
  });

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v && v.duration && isFinite(v.duration)) {
        const diff = targetTime.current - v.currentTime;
        // only seek when meaningfully off, easing toward the target each frame
        if (Math.abs(diff) > 0.01) v.currentTime += diff * EASE;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="main-section" aria-label="Manifesto">
      <video
        ref={videoRef}
        className="main-video"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/hero-aerial.mp4" type="video/mp4" />
      </video>
      <div className="main-scrim" aria-hidden="true" />

      <div className="main-inner">
        <h1
          className="main-manifesto"
          style={{ marginTop: `${TOP_POSITION}px`, fontSize: `${TEXT_SIZE}px` }}
        >
          {MANIFESTO_LINE_1}
          <br />
          {MANIFESTO_LINE_2}
        </h1>

        <div className="main-purpose">
          <h2 className="main-purpose-title">Our purpose</h2>
          <p className="main-purpose-body">
            We are building financial platforms for a billion people. Finance
            must be the bedrock of trust, the enabler of opportunity, and the
            bridge between today’s needs and tomorrow’s dreams for every Indian.
          </p>
        </div>
      </div>
    </section>
  );
}
