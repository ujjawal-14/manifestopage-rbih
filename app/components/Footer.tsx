/**
 * Site footer, mirroring rbihub.in: warm terracotta→vermilion gradient, the
 * RBIH wordmark, the subsidiary description, two link columns (flagship
 * projects + company), then a contact row with email/phone, the Bengaluru
 * address, copyright, company IDs (CIN/GSTN) and the legal links.
 *
 * Content, links, IDs and colours are taken verbatim from the live site. (The
 * real footer renders the RBIH logo asset at 240px; the wordmark below is the
 * same faithful text recreation used in the nav.)
 */
function BulbMark() {
  return (
    <svg
      className="footer-mark"
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
  );
}

function MailIcon() {
  return (
    <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M6.5 3h3l1.5 5-2 1.5a12 12 0 0 0 5 5l1.5-2 5 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" />
    </svg>
  );
}

const PROJECTS = [
  { label: "Unified Lending Interface", href: "/projects/unified-lending-interface" },
  { label: "MuleHunter", href: "/projects/mulehunter" },
  { label: "Digital Payments Intelligence Platform", href: "/projects/digital-payments-intelligence-platform" },
  { label: "Fintech Repository", href: "/projects/fintech-repository" },
];

const COMPANY = [
  { label: "Manifesto", href: "/manifesto" },
  { label: "Resources", href: "/resources" },
  { label: "Team", href: "/team" },
  { label: "Careers", href: "/careers" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <a className="footer-logo" href="/" aria-label="Reserve Bank Innovation Hub home">
          <BulbMark />
          <span className="footer-wordmark">
            <span className="footer-wordmark-top">Reserve Bank</span>
            <span className="footer-wordmark-bottom">Innovation Hub</span>
          </span>
        </a>

        <div className="footer-top">
          <p className="footer-about">
            The RBIH is a wholly-owned subsidiary of the Reserve Bank of India,
            set up to solve for India’s intricate problems in the financial
            sector.
          </p>

          <nav className="footer-links" aria-label="Projects">
            {PROJECTS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>

          <nav className="footer-links" aria-label="Company">
            {COMPANY.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <div className="footer-contact">
            <div className="contact-items">
              <a className="contact-item" href="mailto:communications@rbihub.in">
                <MailIcon />
                communications@rbihub.in
              </a>
              <span className="contact-separator" aria-hidden="true">
                •
              </span>
              <a className="contact-item" href="tel:08022581122">
                <PhoneIcon />
                080-22581122
              </a>
            </div>
            <address className="footer-address">
              KEONICS, 27th Main Rd, 1st Sector, HSR Layout,
              <br />
              Bengaluru, Karnataka-560102
            </address>
            <p className="footer-copy">
              <strong>© 2026 Reserve Bank Innovation Hub</strong>
              <span>All rights reserved.</span>
            </p>
          </div>

          <div className="footer-ids">
            <div>
              <span className="id-name">CIN</span>
              <span>U72900KA2021NPL178293</span>
            </div>
            <div>
              <span className="id-name">GSTN</span>
              <span>29AAKCR9018A1ZB</span>
            </div>
          </div>

          <nav className="footer-legal" aria-label="Legal">
            <a href="/terms-of-use">Terms of Use</a>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="https://rbih-website-assets.s3.ap-south-1.amazonaws.com/resources/RBIH-Whistle-Blower-Policy.pdf">
              Whistleblower Policy
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
