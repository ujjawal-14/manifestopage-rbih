/**
 * RBIH site navigation, matching rbihub.in: lightbulb mark + two-line wordmark,
 * a "WE ARE HIRING!" pill, and the primary links. Sticky, frosted-translucent.
 *
 * Note: the real site uses the "Neurial Grotesk" brand font and the actual
 * lightbulb logo asset — swap those in if/when available. The wordmark below is
 * a faithful text recreation.
 */
export default function Nav() {
  return (
    <header className="site-nav">
      <div className="nav-left">
        <a className="nav-logo" href="/" aria-label="Reserve Bank Innovation Hub home">
          <svg
            className="nav-mark"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18h6" />
            <path d="M10 21h4" />
            <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V18h6v-1.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z" />
          </svg>
          <span className="nav-wordmark">
            <span className="nav-wordmark-top">Reserve Bank</span>
            <span className="nav-wordmark-bottom">Innovation Hub</span>
          </span>
        </a>

        <a className="nav-hiring" href="/careers">
          WE ARE HIRING!
          <span className="nav-hiring-dot" aria-hidden="true" />
        </a>
      </div>

      <nav className="nav-links" aria-label="Primary">
        <a href="#our-work">Our work</a>
        <a href="https://docs.rbihub.in">Docs</a>
        <a href="/team">Team</a>
      </nav>
    </header>
  );
}
