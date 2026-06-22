// Four guiding principles, laid out as a 2x2 grid below the postcards. Each
// point's icon is drawn as an engraved postage stamp (perforated edge + paper
// grain, matching the postcards) — see .tenet-stamp in globals.css.

function ShieldIcon() {
  return (
    <svg className="tenet-icon" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 4 L41 10 L41 22 C41 33 33.5 40.5 24 44 C14.5 40.5 7 33 7 22 L7 10 Z" />
      <path d="M16.5 23.5 L22 29 L31.5 17.5" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg className="tenet-icon tenet-icon--fill" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M20 6 C20.9 14.5 21.5 15.1 30 16 C21.5 16.9 20.9 17.5 20 26 C19.1 17.5 18.5 16.9 10 16 C18.5 15.1 19.1 14.5 20 6 Z" />
      <path d="M34 24 C34.5 28.5 34.8 28.8 39 29.5 C34.8 30.2 34.5 30.5 34 35 C33.5 30.5 33.2 30.2 29 29.5 C33.2 28.8 33.5 28.5 34 24 Z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="tenet-icon" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="15.5" cy="16" r="7.5" />
      <circle cx="15.5" cy="16" r="2.4" />
      <path d="M20.8 21.3 L37 37.5" />
      <path d="M31 31.5 L35.5 27" />
      <path d="M27.5 28 L31.5 24" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="tenet-icon" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 41 C9 30 8 18.5 16 14.5 C20 12.5 23 14 24 17 C25 14 28 12.5 32 14.5 C40 18.5 39 30 24 41 Z" />
      <text x="24" y="29" textAnchor="middle" fontSize="15">
        ₹
      </text>
    </svg>
  );
}

const TENETS = [
  {
    key: "trust",
    icon: <ShieldIcon />,
    title: "Secure by design",
    body: "Trust is the bedrock of finance. We build systems that protect before problems arise, embedding resilience at every layer of India’s financial infrastructure.",
  },
  {
    key: "ai",
    icon: <SparkIcon />,
    title: "AI-enabled",
    body: "Intelligence transforms possibility. AI lets India leapfrog decades-old constraints, creating financial solutions that understand and adapt to a billion unique needs.",
  },
  {
    key: "frictionless",
    icon: <KeyIcon />,
    title: "Frictionless",
    body: "Financial services should disappear into daily life. No barriers, no complexity—just tools that work exactly when and how people need them.",
  },
  {
    key: "empathetic",
    icon: <HeartIcon />,
    title: "Empathetic",
    body: "Technology without humanity is incomplete. We design for the full spectrum of Indian realities, ensuring finance serves people, not the other way around.",
  },
];

export default function Tenets() {
  return (
    <section className="tenets" aria-label="Our guiding principles">
      <div className="tenet-grid">
        {TENETS.map((t) => (
          <article className="tenet" key={t.key}>
            <span className="tenet-stamp">
              <span className="tenet-stamp-face">{t.icon}</span>
            </span>
            <div className="tenet-text">
              <h3>{t.title}</h3>
              <p>{t.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
