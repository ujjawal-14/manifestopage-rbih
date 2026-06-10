"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";

/**
 * Scene 1 — a scroll-scrubbed envelope, staged in four beats:
 *
 *   0.00 – 0.28  RISE    envelope starts low (centre-bottom) and rises to centre
 *   0.30 – 0.52  OPEN    flap hinges open
 *   0.52 – 0.92  EJECT   letter slides up while the envelope eases back down,
 *                        so the letter + content settles in the centre
 *   0.92 – 1.00  HOLD    everything rests (scroll buffer)
 *
 * The scene is a tall (sceneVh) section; a sticky 100vh stage pins it while
 * `scrollYProgress` (0 -> 1) drives every value — so scrolling up reverses it.
 * Vertical positions are fractions of the measured viewport height so the
 * framing holds across screen sizes. All knobs live in TUNING.
 */
const TUNING = {
  sceneVh: 340, // total scroll length of the scene
  rise: { endAt: 0.28 }, // envelope finishes rising
  flap: { startAt: 0.3, openBy: 0.52, angle: 178, behindAt: 0.41 },
  letter: { startAt: 0.52, endAt: 0.92 }, // eject window (also the settle window)
  // Vertical positions as fractions of viewport height (+ = down from centre):
  pos: {
    bottomGap: 280, // px gap kept below the envelope at its starting (low) spot
    raised: 0.18, // where the envelope sits while opening (low enough that the tall open flap clears the fixed nav)
    settle: 0.48, // where the envelope eases down to as the letter ejects
    letterTravel: -0.45, // how far the letter rises out of the envelope
  },
};

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

function Manifesto() {
  return (
    <>
      <p className="eyebrow">Reserve Bank Innovation Hub</p>
      <h1>Our purpose</h1>
      <p className="lede">
        We are building financial platforms for a billion people.
      </p>
      <p className="lede">
        Finance must be the bedrock of trust, the enabler of opportunity, and
        the bridge between today’s needs and tomorrow’s dreams for every Indian.
      </p>
    </>
  );
}

export default function EnvelopeScene() {
  const sceneRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const vh = useViewportHeight();

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  // Vertical anchors (px from the flex-centred baseline; + = down).
  const envBottom = vh / 2 - TUNING.pos.bottomGap; // starting low spot
  const envRaised = TUNING.pos.raised * vh;
  const envSettle = TUNING.pos.settle * vh;
  const letterTravel = TUNING.pos.letterTravel * vh;

  // Envelope: rise -> hold (while flap opens) -> settle back down.
  const envelopeY = useTransform(
    scrollYProgress,
    [0, TUNING.rise.endAt, TUNING.flap.openBy, TUNING.letter.endAt, 1],
    [envBottom, envRaised, envRaised, envSettle, envSettle],
  );

  // Flap hinges open on rotateX; backface-visibility hides it once it folds back.
  const flapRotate = useTransform(
    scrollYProgress,
    [0, TUNING.flap.startAt, TUNING.flap.openBy, 1],
    [0, 0, TUNING.flap.angle, TUNING.flap.angle],
  );
  const flapZ = useTransform(scrollYProgress, (v) =>
    v < TUNING.flap.behindAt ? 6 : 0,
  );
  // Soft shadow cast into the opening as the flap lifts; gone once it folds away.
  const flapShadow = useTransform(
    scrollYProgress,
    [0, TUNING.flap.startAt, 0.4, 0.5, TUNING.flap.openBy, 1],
    [0, 0, 0.5, 0.3, 0, 0],
  );

  // Letter slides up out of the envelope as the envelope eases down.
  const letterY = useTransform(
    scrollYProgress,
    [0, TUNING.letter.startAt, TUNING.letter.endAt, 1],
    [0, 0, letterTravel, letterTravel],
  );
  const hintOpacity = useTransform(scrollYProgress, [0, 0.05, 1], [1, 0, 0]);

  // Accessibility: show the manifesto as a plain, readable card — no scroll
  // choreography — for anyone who prefers reduced motion.
  if (reduce) {
    return (
      <section
        className="manifesto-static"
        aria-label="Reserve Bank Innovation Hub manifesto"
      >
        <article className="letter letter--flat">
          <div className="letter-content">
            <Manifesto />
          </div>
        </article>
      </section>
    );
  }

  return (
    <section
      ref={sceneRef}
      className="scene"
      style={{ height: `${TUNING.sceneVh}vh` }}
      aria-label="Reserve Bank Innovation Hub manifesto"
    >
      <div className="scene-sticky">
        <motion.div className="envelope-rise" style={{ y: envelopeY }}>
          <div className="envelope">
            <div className="back-wall" aria-hidden />

            <motion.div className="letter" style={{ y: letterY }}>
              <div className="letter-content">
                <Manifesto />
              </div>
            </motion.div>

            {/* Four flaps meet at the centre to read as an envelope back */}
            <div className="side-flap side-flap--left" aria-hidden />
            <div className="side-flap side-flap--right" aria-hidden />
            <div className="front-panel" aria-hidden />

            {/* RBI seal pressed into the lower triangle as a tone-on-tone emboss */}
            <div className="env-emboss" aria-hidden />

            <motion.div
              className="flap-shadow"
              style={{ opacity: flapShadow }}
              aria-hidden
            />
            <motion.div
              className="flap"
              style={{ rotateX: flapRotate, zIndex: flapZ }}
              aria-hidden
            >
              {/* two-sided flap: the front face (--env-flap) folds open to
                  reveal the underside (#c1b692). shape: flat top -> stepped
                  sides -> long V-point overlapping the lower flap. responsive
                  via viewBox + --s. */}
              <div className="flap-face flap-face--front">
                <svg
                  className="flap-svg"
                  viewBox="100 0 480 300"
                  preserveAspectRatio="none"
                >
                  <polygon points="100,0 580,0 560,150 340,300 120,150" />
                </svg>
              </div>
              <div className="flap-face flap-face--back">
                <svg
                  className="flap-svg"
                  viewBox="100 0 480 300"
                  preserveAspectRatio="none"
                >
                  <polygon points="100,0 580,0 560,150 340,300 120,150" />
                </svg>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="scroll-hint"
          style={{ opacity: hintOpacity }}
          aria-hidden
        >
          <span>Scroll to open</span>
          <span className="chevron" />
        </motion.div>
      </div>
    </section>
  );
}
