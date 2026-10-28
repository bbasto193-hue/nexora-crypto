import React from 'react';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  embedded?: boolean;
}

const ReferenceCode: React.FC = () => (
  <div className="auth-code-panel" aria-label="Binance QR code from the NOVEXA reference">
    <div className="auth-code-copy">
      <span className="auth-code-brand">
        <svg className="auth-code-brand-mark" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 1.5 3.2 3.2L12 7.9 8.8 4.7 12 1.5ZM4.7 8.8 7.9 12l-3.2 3.2L1.5 12l3.2-3.2ZM19.3 8.8l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2ZM12 16.1l3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2ZM12 8.4l3.6 3.6-3.6 3.6L8.4 12 12 8.4Z" fill="currentColor" />
        </svg>
        BINANCE
      </span>
      <span className="auth-code-caption">Scan QR</span>
    </div>
    <span className="auth-code-divider" aria-hidden="true" />
    <img className="auth-code-art" src="/assets/novexa-binance-qr.png" alt="Original Binance QR code" />
  </div>
);

const BrandMark: React.FC<{ large?: boolean }> = ({ large = false }) => (
  <svg className={large ? 'auth-logo-mark auth-logo-mark-large' : 'auth-logo-mark'} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M32 3.5 56.7 17.8v28.4L32 60.5 7.3 46.2V17.8L32 3.5Z" stroke="url(#authLogoGradient)" strokeWidth="5" strokeLinejoin="round" />
    <path d="M22 43V21l20 22V21" stroke="#08d7f4" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="authLogoGradient" x1="7" y1="4" x2="57" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#08e5f7" />
        <stop offset="1" stopColor="#1264ff" />
      </linearGradient>
    </defs>
  </svg>
);

const LandscapeArtwork: React.FC = () => (
  <svg className="auth-landscape" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="spaceGlow" cx="33%" cy="30%" r="72%">
        <stop stopColor="#07366d" stopOpacity=".72" />
        <stop offset=".62" stopColor="#03152f" stopOpacity=".45" />
        <stop offset="1" stopColor="#010714" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="planetFill" cx="35%" cy="32%" r="75%">
        <stop stopColor="#1269b7" />
        <stop offset=".58" stopColor="#063166" />
        <stop offset="1" stopColor="#020b1d" />
      </radialGradient>
      <linearGradient id="planetRim" x1="240" y1="15" x2="700" y2="590" gradientUnits="userSpaceOnUse">
        <stop stopColor="#08d9ff" />
        <stop offset=".56" stopColor="#087bff" />
        <stop offset="1" stopColor="#073d92" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="ridge" x1="700" y1="500" x2="850" y2="900" gradientUnits="userSpaceOnUse">
        <stop stopColor="#092954" />
        <stop offset="1" stopColor="#020817" />
      </linearGradient>
      <linearGradient id="water" x1="650" y1="610" x2="700" y2="900" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0879df" stopOpacity=".8" />
        <stop offset="1" stopColor="#010918" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="coinFace" cx="35%" cy="28%" r="80%">
        <stop stopColor="#0b4b8c" />
        <stop offset="1" stopColor="#03142f" />
      </radialGradient>
      <filter id="blueGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="12" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <pattern id="planetTexture" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(24)">
        <path d="M0 8h36M0 26h36" stroke="#55bdff" strokeOpacity=".1" strokeWidth="1" />
        <circle cx="10" cy="17" r="1" fill="#70cfff" fillOpacity=".14" />
      </pattern>
    </defs>
    <rect width="1440" height="900" fill="url(#spaceGlow)" />
    <circle cx="420" cy="225" r="333" fill="url(#planetFill)" />
    <circle cx="420" cy="225" r="333" fill="url(#planetTexture)" opacity=".8" />
    <circle cx="420" cy="225" r="333" fill="none" stroke="url(#planetRim)" strokeWidth="8" filter="url(#blueGlow)" />
    <path d="M0 630 125 580 194 616 276 533 341 584 427 527 502 589 587 516 670 584 753 516 834 580 925 512 1013 579 1108 514 1193 574 1290 510 1440 563v337H0Z" fill="#06152d" />
    <path d="m0 684 130-97 77 40 122-134 103 110 107-73 83 92 123-103 119 89 107-68 113 73 107-95 149 79v303H0Z" fill="url(#ridge)" />
    <path d="M0 727 119 657l96 59 105-70 74 63 109-36 104 76 129-48 109 62 124-50 120 44 112-66 148 60v149H0Z" fill="#020b1c" />
    <path d="M0 652c168 36 243 71 393 57 143-13 244-78 386-48 132 28 211 22 331-19 134-45 226-13 330 7v251H0Z" fill="url(#water)" opacity=".7" />
    <g fill="none" stroke="#0b8dff" strokeOpacity=".54" strokeWidth="2">
      <path d="M472 690c178 10 324-18 518 18" /><path d="M545 718c153-3 282 1 415 23" />
      <path d="M675 750c144-10 237 4 356 16" /><path d="M842 786c91-6 164 5 238 17" />
      <path d="m0 692 121-35 93 47 105-76 75 82" /><path d="m0 742 102-40 95 39 82-44" />
    </g>
    <g filter="url(#blueGlow)" opacity=".75">
      <path d="M498 649h466" stroke="#087cff" strokeWidth="2" />
      <path d="M535 665h383" stroke="#08c8ff" strokeOpacity=".5" />
    </g>
    <g transform="translate(205 655) rotate(-13)">
      <circle r="85" fill="#03132c" stroke="#087fea" strokeWidth="5" />
      <circle r="75" fill="url(#coinFace)" stroke="#32aaff" strokeOpacity=".72" strokeWidth="2" />
      <circle r="62" fill="none" stroke="#51baff" strokeOpacity=".35" strokeWidth="2" />
      <text x="0" y="25" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="86" fontWeight="700" fill="#08a9f3" stroke="#04264f" strokeWidth="2">₿</text>
    </g>
    <g transform="translate(381 720) rotate(7)">
      <circle r="75" fill="#03132c" stroke="#087fea" strokeWidth="5" />
      <circle r="66" fill="url(#coinFace)" stroke="#32aaff" strokeOpacity=".72" strokeWidth="2" />
      <circle r="54" fill="none" stroke="#51baff" strokeOpacity=".35" strokeWidth="2" />
      <path d="m0-47 27 47L0 47-27 0Z" fill="#13cafa" /><path d="M0-47v47l27 0Z" fill="#438aff" />
      <path d="m0 7 19-1-19 34-19-34Z" fill="#168cff" /><path d="M0 7v33l19-34Z" fill="#08caff" />
    </g>
    <g transform="translate(535 770) rotate(16)">
      <circle r="61" fill="#03132c" stroke="#087fea" strokeWidth="5" />
      <circle r="52" fill="url(#coinFace)" stroke="#32aaff" strokeOpacity=".72" strokeWidth="2" />
      <circle r="42" fill="none" stroke="#51baff" strokeOpacity=".35" strokeWidth="2" />
      <path d="M-23-11 0-25 23-11 12-5 0-12-11-5Z" fill="#13cafa" />
      <path d="M-23 2-12 8 0 1 12 8 23 2 23 15 0 29-23 15Z" fill="#168cff" />
    </g>
  </svg>
);

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, embedded = false }) => (
  <div className={`auth-shell${embedded ? ' auth-shell-embedded' : ''}`}>
    {!embedded && (
      <>
        <div className="auth-art-layer"><LandscapeArtwork /></div>
        <div className="auth-shade" />
        <div className="auth-moon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="M20.2 15.1A8.3 8.3 0 0 1 8.9 3.8 8.4 8.4 0 1 0 20.2 15.1Z" stroke="currentColor" strokeWidth="1.5" /></svg>
        </div>

        <section className="auth-brand-panel" aria-label="NOVEXA SOFTWARE">
          <BrandMark large />
          <div className="auth-brand-name">NOVEXA</div>
          <div className="auth-brand-subtitle">SOFTWARE</div>
          <p>The Next Generation of Digital Assets.</p>
        </section>
      </>
    )}

    <main className="auth-content-column">
      <div className="auth-form-frame">
        <header className="auth-card-brand">
          <BrandMark />
          <div className="auth-card-wordmark">NOVEXA</div>
          <div className="auth-card-subtitle">SOFTWARE</div>
        </header>
        <div className="auth-form-body">{children}</div>
      </div>
      {!embedded && <ReferenceCode />}
    </main>
  </div>
);
