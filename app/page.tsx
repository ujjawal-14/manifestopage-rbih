import EnvelopeScene from "./components/EnvelopeScene";
import MainSection from "./components/MainSection";
import ProgressScene from "./components/ProgressScene";
import PostcardsScene from "./components/PostcardsScene";
import Tenets from "./components/Tenets";

export default function Home() {
  return (
    <main>
      <EnvelopeScene />

      {/* The hero stays pinned while "Where India stands today" tears up over
          it (the wrapper bounds the hero's sticky pin to this pair). */}
      <div className="reveal">
        {/* Main hero — the manifesto statement over the scroll-scrubbed video. */}
        <MainSection />

        {/* "Where India stands today" — tears up over the pinned hero, then
            slides the text left to reveal the three data cards. */}
        <ProgressScene />
      </div>

      {/* Revealed as the hero scrolls up and away; the stacked postcards then
          swap on scroll. Grey placeholders for now. */}
      <PostcardsScene />

      <section
        className="principles-intro"
        aria-label="Principles for India’s financial foundations"
      >
        <div className="principles-intro-inner">
          <h2 className="principles-intro-title">
            Principles for India’s financial foundations
          </h2>
          <p>
            India deserves a financial infrastructure built on strong
            fundamentals.
          </p>
          <p>
            These beliefs shape every system we create, every problem we solve,
            and every innovation we bring to our nation’s financial landscape.
          </p>
        </div>
      </section>

      {/* Four guiding principles as a 2x2 grid of stamp-iconed points. */}
      <Tenets />
    </main>
  );
}
