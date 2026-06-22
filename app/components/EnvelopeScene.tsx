"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { useVisible } from "../config/visibility";

/**
 * Scene 1 — a scroll-scrubbed envelope, staged in four beats:
 *
 *   0.00 – 0.28  RISE    envelope starts low (centre-bottom) and rises to centre
 *   0.30 – 0.52  OPEN    flap hinges open
 *   0.52 – 0.92  EJECT   letter slides up out of the envelope; the envelope
 *                        holds near centre so the whole envelope + the ejected
 *                        letter stay fully on screen (never clipped)
 *   0.92 – 1.00  HOLD    everything rests (scroll buffer) before the hero
 *                        scrolls up to reveal the postcards below
 *
 * The scene is a tall (sceneVh) section; a sticky 100vh stage pins it while
 * `scrollYProgress` (0 -> 1) drives every value — so scrolling up reverses it.
 * Vertical positions are fractions of the measured viewport height so the
 * framing holds across screen sizes. All knobs live in TUNING.
 */
const STICKY_VH = 100; // height of the pinned stage
const EXTRA_HOLD_VH = 100; // one extra viewport of stillness AFTER the letter is fully out, before the hero scrolls up to reveal the postcards

const TUNING = {
  sceneVh: 440, // total scroll length of the scene (240vh choreography + 100vh end-hold buffer + 100vh extra hold)
  rise: { endAt: 0.28 }, // envelope finishes rising
  flap: { startAt: 0.3, openBy: 0.52, angle: 178, behindAt: 0.41 },
  letter: { startAt: 0.52, endAt: 0.92 }, // eject window (also the settle window)
  // Vertical positions as fractions of viewport height (+ = down from centre):
  pos: {
    startClip: 0.06, // at the start only this fraction of the envelope's height sits below the bottom edge, so the RBI seal (at 78% down the envelope) stays visible
    raised: 0.18, // where the envelope sits while opening (low enough that the tall open flap clears the fixed nav)
    settle: 0.16, // where the envelope rests as the letter ejects — kept high enough that the whole envelope stays inside the viewport (so it's never clipped when the hero scrolls up)
    letterTravel: -0.28, // how far the letter rises out of the envelope (paired with `settle` so envelope + ejected letter both fit on screen)
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
  const showEnvelope = useVisible("envelope");
  const showHeading = useVisible("manifestoHeading");

  // When the envelope sequence is hidden, don't mount the animated component at
  // all (so Motion's scroll hooks never run against an unattached ref). Show
  // just the heading on its own if it's switched on, otherwise nothing.
  if (!showEnvelope) {
    if (!showHeading) return null;
    return (
      <section
        className="manifesto-static"
        aria-label="Reserve Bank Innovation Hub manifesto"
      >
        <p className="manifesto-quote manifesto-quote--static">
          A manifesto — to build the foundational rails of India’s financial
          future
        </p>
      </section>
    );
  }
  return <EnvelopeAnimated />;
}

function EnvelopeAnimated() {
  const showHeading = useVisible("manifestoHeading");
  const sceneRef = useRef<HTMLElement>(null);
  const envRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const vh = useViewportHeight();

  // Measure the envelope's real rendered height so the starting position can be
  // pinned relative to it (the size is fixed CSS px that don't scale with vh,
  // and shrinks on mobile via --s).
  const [envH, setEnvH] = useState(494); // default = 380px * 1.3 (desktop --s)
  useEffect(() => {
    const measure = () => {
      if (envRef.current) setEnvH(envRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  // Run the full choreography over the front portion of the scroll, then hold
  // at its end state for one extra viewport (EXTRA_HOLD_VH) before the scene
  // releases and the hero scrolls up — so the letter sits fully ejected for a
  // beat instead of immediately moving up. All TUNING fractions below are
  // expressed against this remapped `progress`, so their pacing is unchanged.
  const scrubVh = TUNING.sceneVh - STICKY_VH;
  const chorEnd = (scrubVh - EXTRA_HOLD_VH) / scrubVh;
  const progress = useTransform(scrollYProgress, [0, chorEnd, 1], [0, 1, 1]);

  // Vertical anchors (px from the flex-centred baseline; + = down).
  // Start: translate the flex-centred envelope down so only `startClip` of its
  // height drops below the bottom edge (most of it — incl. the RBI seal — shows).
  const envBottom = vh / 2 - (0.5 - TUNING.pos.startClip) * envH;
  const envRaised = TUNING.pos.raised * vh;
  const envSettle = TUNING.pos.settle * vh;
  const letterTravel = TUNING.pos.letterTravel * vh;

  // Envelope: rise -> hold (while flap opens) -> settle back down.
  const envelopeY = useTransform(
    progress,
    [0, TUNING.rise.endAt, TUNING.flap.openBy, TUNING.letter.endAt, 1],
    [envBottom, envRaised, envRaised, envSettle, envSettle],
  );

  // Flap hinges open on rotateX; backface-visibility hides it once it folds back.
  const flapRotate = useTransform(
    progress,
    [0, TUNING.flap.startAt, TUNING.flap.openBy, 1],
    [0, 0, TUNING.flap.angle, TUNING.flap.angle],
  );
  const flapZ = useTransform(progress, (v) =>
    v < TUNING.flap.behindAt ? 6 : 0,
  );
  // Soft shadow cast into the opening as the flap lifts; gone once it folds away.
  const flapShadow = useTransform(
    progress,
    [0, TUNING.flap.startAt, 0.4, 0.5, TUNING.flap.openBy, 1],
    [0, 0, 0.5, 0.3, 0, 0],
  );

  // Letter slides up out of the envelope as the envelope eases down.
  const letterY = useTransform(
    progress,
    [0, TUNING.letter.startAt, TUNING.letter.endAt, 1],
    [0, 0, letterTravel, letterTravel],
  );
  const hintOpacity = useTransform(progress, [0, 0.05, 1], [1, 0, 0]);
  // Specular sheen: pan the gold-foil gradient across the seal as the envelope
  // moves, so the highlight bands sweep like real foil catching the light.
  const embossSheen = useTransform(
    progress,
    [0, 1],
    ["0% 100%", "100% 0%"],
  );
  // Top tagline fades out across the flap-open window: full while the envelope
  // rises, gone by the time the flap finishes opening (anchored across [0,1]).
  const quoteOpacity = useTransform(
    progress,
    [0, TUNING.flap.startAt, TUNING.flap.openBy, 1],
    [1, 1, 0, 0],
  );

  // Accessibility: show the manifesto as a plain, readable card — no scroll
  // choreography — for anyone who prefers reduced motion.
  if (reduce) {
    return (
      <section
        className="manifesto-static"
        aria-label="Reserve Bank Innovation Hub manifesto"
      >
        {showHeading && (
          <p className="manifesto-quote manifesto-quote--static">
            A manifesto — to build the foundational rails of India’s financial
            future
          </p>
        )}

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
        {showHeading && (
          <motion.p
            className="manifesto-quote"
            style={{ opacity: quoteOpacity }}
          >
            A manifesto — to build the foundational rails of India’s financial
            future
          </motion.p>
        )}

        <motion.div className="envelope-rise" style={{ y: envelopeY }}>
          <div className="envelope" ref={envRef}>
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

            {/* RBI seal as a gold-foil stamp; its highlight sweeps with scroll */}
            <motion.div
              className="env-emboss"
              style={{ backgroundPosition: embossSheen }}
              aria-hidden
            />

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
                  reveal the underside (#c1b692). shape (flat top -> stepped
                  sides -> long V-point overlapping the lower flap) + paper
                  grain come from CSS clip-path/background on .flap-face. */}
              <div className="flap-face flap-face--front" />
              <div className="flap-face flap-face--back" />
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
