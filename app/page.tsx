export default function Home() {
  return (
    <main className="envelope" aria-label="Envelope back">
      <div className="envelope-back-rect" />
      <div className="envelope-top-flap" aria-hidden="true">
        <div className="envelope-top-triangle-shadow" aria-hidden="true">
          <svg
            className="envelope-top-triangle-shadow-svg"
            viewBox="0 0 950 488"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <filter id="triangleShadowBlur" x="-30%" y="-30%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="18" />
              </filter>
            </defs>
            <path
              d="M475 0 L950 488 L0 488 Z"
              fill="rgba(0, 0, 0, 0.18)"
              filter="url(#triangleShadowBlur)"
              transform="matrix(1 0 0 -1 0 488)"
            />
          </svg>
        </div>
        <div className="envelope-top-triangle" aria-hidden="true" />
      </div>
      <div className="envelope-front-group">
        <div className="envelope-back-triangle" />
        <div className="envelope-back-triangle envelope-back-triangle-left" />
        <div className="envelope-middle-parallelogram" />
      </div>
    </main>
  );
}
