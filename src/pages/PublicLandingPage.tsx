import React, { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  History,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  Menu,
  QrCode,
  ShieldCheck,
  Wallet,
  X
} from 'lucide-react';
import { LoginPage } from './auth/LoginPage';
import { RegisterPage } from './auth/RegisterPage';
import { ForgotPasswordPage } from './auth/ForgotPasswordPage';
import { SUBSCRIPTION_DURATION_DAYS, SUBSCRIPTION_PLANS } from '../services/subscriptionPlans';
import './PublicLandingPage.css';

type AuthView = 'register' | 'login' | 'forgot';

const formatPlanUsd = (amount: number) => `$${amount.toLocaleString('en-US')}`;
const plans = SUBSCRIPTION_PLANS.map((plan) => ({
  id: plan.id,
  price: formatPlanUsd(plan.priceUsd),
  dailyCredit: formatPlanUsd(plan.dailyCreditUsd),
  totalCredits: formatPlanUsd(plan.totalCreditUsd),
  featured: plan.id === 1
}));

const platformFeatures = [
  {
    icon: LayoutDashboard,
    title: 'Portfolio overview',
    description: 'Review portfolio value, cash allocation, performance, and asset distribution from one dashboard.'
  },
  {
    icon: BarChart3,
    title: 'Digital asset tracking',
    description: 'Explore digital asset information and follow modeled price movements.'
  },
  {
    icon: History,
    title: 'Transaction history',
    description: 'Review the activity ledger for practice trades, swaps, transfers, and deposits.'
  },
  {
    icon: Wallet,
    title: 'Organized workspace',
    description: 'Move between portfolio, markets, trading, analytics, and account settings in one interface.'
  }
];

const LandingMark = () => (
  <span className="landing-mark" aria-hidden="true">
    <svg viewBox="0 0 40 40" fill="none">
      <path d="M20 2.5 35.2 11.3v17.4L20 37.5 4.8 28.7V11.3L20 2.5Z" stroke="url(#landing-mark-gradient)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M14 27V13l13 14V13" stroke="#34d8f6" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <defs><linearGradient id="landing-mark-gradient" x1="5" y1="3" x2="35" y2="37"><stop stopColor="#55efff" /><stop offset="1" stopColor="#397cff" /></linearGradient></defs>
    </svg>
  </span>
);

const DashboardPreview = () => (
  <div className="landing-preview" aria-label="Illustration of the NEXORA portfolio dashboard">
    <div className="preview-window-bar"><span /><span /><span /><b>NEXORA <small>OVERVIEW</small></b><i>ILLUSTRATIVE PREVIEW</i></div>
    <div className="preview-content">
      <div className="preview-label">TOTAL PORTFOLIO VALUE <span>24H</span></div>
      <div className="preview-value">$105,116.70 <strong>+2.96%</strong></div>
      <svg className="preview-chart" viewBox="0 0 520 156" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="preview-area" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#23c7f5" stopOpacity=".3" /><stop offset="1" stopColor="#23c7f5" stopOpacity="0" /></linearGradient></defs>
        <path d="M0 125 C34 117 45 100 76 108 S125 88 150 98 S190 52 224 76 S274 58 298 67 S340 35 369 52 S409 34 431 42 S481 16 520 25 V156 H0Z" fill="url(#preview-area)" />
        <path d="M0 125 C34 117 45 100 76 108 S125 88 150 98 S190 52 224 76 S274 58 298 67 S340 35 369 52 S409 34 431 42 S481 16 520 25" fill="none" stroke="#42d9ff" strokeWidth="3" />
      </svg>
      <div className="preview-stats">
        <div><small>ILLUSTRATIVE CASH</small><strong>$18,450.00</strong><span>Preview value only</span></div>
        <div><small>ASSETS TRACKED</small><strong>12 <em>digital assets</em></strong><span>Illustrative preview data</span></div>
        <div className="preview-mini-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      </div>
    </div>
    <div className="preview-glow" aria-hidden="true" />
  </div>
);

export const PublicLandingPage: React.FC = () => {
  const [authView, setAuthView] = useState<AuthView>('register');
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [paymentQrLoaded, setPaymentQrLoaded] = useState(false);
  const accountRef = useRef<HTMLElement>(null);
  const plansRef = useRef<HTMLElement>(null);

  const scrollTo = (target: 'plans' | 'account' | 'contact', nextAuthView?: AuthView) => {
    if (nextAuthView) setAuthView(nextAuthView);
    setMenuOpen(false);
    const section = target === 'plans'
      ? plansRef.current
      : target === 'account'
        ? accountRef.current
        : document.getElementById('contact');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('alphaprimealphaprime5@gmail.com');
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      setEmailCopied(false);
    }
  };

  return (
    <div className="public-landing">
      <header className="landing-header">
        <a className="landing-brand" href="#home" aria-label="NEXORA home"><LandingMark /><span>NEXORA<small>DIGITAL FINANCE</small></span></a>
        <button className="landing-menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}>
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={`landing-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <a href="#features" onClick={() => setMenuOpen(false)}>Platform</a>
          <button type="button" onClick={() => scrollTo('plans')}>Plans</button>
          <button type="button" onClick={() => scrollTo('account', 'login')}>Log in</button>
          <button className="landing-nav-cta" type="button" onClick={() => scrollTo('account', 'register')}>Create account <ArrowRight /></button>
        </nav>
      </header>

      <main>
        <section className="landing-hero" id="home">
          <div className="landing-hero-copy">
            <div className="landing-eyebrow"><span /> A CLEARER VIEW OF DIGITAL FINANCE</div>
            <h1>Welcome to <span>NEXORA</span></h1>
            <p className="landing-tagline">Your Digital Finance Experience, All in One Place.</p>
            <p className="landing-description">NEXORA brings portfolio tracking, digital asset information, and a streamlined dashboard experience together in one place. Explore the platform, review available plans, and discover its features.</p>
            <div className="landing-hero-actions">
              <button className="landing-button landing-button-primary" type="button" onClick={() => scrollTo('plans')}>Explore Plans <ArrowDown /></button>
              <button className="landing-button landing-button-quiet" type="button" onClick={() => scrollTo('account', 'register')}>Get Started <ArrowRight /></button>
            </div>
            <div className="landing-trust-note"><ShieldCheck /> Explore portfolio tools with modeled account activity</div>
          </div>
          <DashboardPreview />
          <div className="landing-hero-orb landing-hero-orb-one" aria-hidden="true" />
          <div className="landing-hero-orb landing-hero-orb-two" aria-hidden="true" />
        </section>

        <section className="landing-features landing-section" id="features">
          <div className="landing-section-heading">
            <div className="landing-eyebrow">A CONNECTED WORKSPACE</div>
            <h2>Everything in view.<br /><span>Nothing in the way.</span></h2>
            <p>Tools in NEXORA help you review portfolio positions, digital assets, and account activity.</p>
          </div>
          <div className="landing-feature-grid">
            {platformFeatures.map(({ icon: Icon, title, description }, index) => (
              <article className="landing-feature-card" key={title} style={{ animationDelay: `${index * 80}ms` }}>
                <div className="landing-feature-icon"><Icon /></div>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="feature-card-index">0{index + 1}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-plans landing-section" id="plans" ref={plansRef}>
          <div className="landing-section-heading landing-section-heading-centered">
            <div className="landing-eyebrow">EXPLORE THE OPTIONS</div>
            <h2>Plans for your <span>workspace.</span></h2>
            <p>Review the configured plan prices and illustrative credit schedules. Credit figures are not funds or promised returns.</p>
          </div>
          <div className="landing-plan-grid">
            {plans.map((plan) => (
              <button
                className={`landing-plan-card ${plan.featured ? 'is-featured' : ''} ${selectedPlan === plan.id ? 'is-selected' : ''}`}
                key={plan.id}
                type="button"
                aria-pressed={selectedPlan === plan.id}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.featured && <span className="landing-plan-badge">START HERE</span>}
                <span className="landing-plan-top"><span>PLAN 0{plan.id}</span>{selectedPlan === plan.id && <Check />}</span>
                <span className="landing-plan-price">{plan.price}<small>configured plan price</small></span>
                <span className="landing-plan-divider" />
                <span className="landing-plan-credit-label">Illustrative daily credit</span>
                <span className="landing-plan-credit">{plan.dailyCredit}</span>
                <span className="landing-plan-detail"><Clock3 /> Duration <strong>{SUBSCRIPTION_DURATION_DAYS} days</strong></span>
                <span className="landing-plan-detail"><Wallet /> Total illustrative credits <strong>{plan.totalCredits}</strong></span>
                <span className="landing-plan-select">{selectedPlan === plan.id ? 'Selected for review' : 'Select to highlight'} <ArrowRight /></span>
              </button>
            ))}
          </div>
          <p className="landing-plan-disclaimer"><LockKeyhole /> Selecting a plan only highlights it. This page does not process payment, activate subscriptions, or issue credits.</p>
        </section>

        <section className="landing-payment landing-section" id="subscription-payment" aria-labelledby="subscription-payment-title">
          <div className="landing-payment-copy">
            <div className="landing-eyebrow">CRYPTOCURRENCY PAYMENT REQUEST</div>
            <h2 id="subscription-payment-title">Subscribe to NEXORA</h2>
            <p>Request a subscription by transferring cryptocurrency to the owner&apos;s Binance account. Payments are not processed or verified on this website.</p>
            <div className="landing-payment-note">
              <ShieldCheck />
              <p>After completing your transfer, contact the NEXORA team through the existing Contact &amp; Inquiries section and provide your payment receipt to request subscription activation.</p>
            </div>
            <button className="landing-button landing-button-primary landing-payment-contact" type="button" onClick={() => scrollTo('contact')}>
              Contact NEXORA Team <ArrowRight />
            </button>
          </div>
          <div className="landing-payment-panel">
            <div className="landing-payment-panel-heading">
              <div><span className="landing-payment-overline">BINANCE PAYMENT</span><h3>Owner&apos;s payment QR</h3></div>
              <span className="landing-payment-status"><span /> QR not independently verified</span>
            </div>
            <div className={`landing-qr-placeholder${paymentQrLoaded ? ' has-image' : ''}`}>
              <img
                className="landing-payment-qr"
                src="/images/WhatsApp%20Image%202026-10-27%20at%207.44.30%20PM.jpeg"
                alt="NEXORA Binance payment QR code"
                onLoad={() => setPaymentQrLoaded(true)}
                onError={() => setPaymentQrLoaded(false)}
              />
              {!paymentQrLoaded && (
                <div className="landing-qr-frame" role="status">
                  <QrCode aria-hidden="true" />
                  <span>Payment QR Code Will Be Available Here</span>
                </div>
              )}
            </div>
            <p className="landing-payment-instructions">Scan the QR code to send your subscription payment through Binance. Verify the cryptocurrency, network, and amount before confirming your transfer.</p>
          </div>
        </section>

        <section className="landing-account landing-section" id="account" ref={accountRef}>
          <div className="landing-account-copy">
            <div className="landing-eyebrow">YOUR WORKSPACE STARTS HERE</div>
            <h2>{authView === 'register' ? 'Create Your NEXORA Account' : authView === 'login' ? 'Already have an account? Log In' : 'Reset your password'}</h2>
            <p>Access your personal portfolio workspace and account tools.</p>
            <div className="landing-account-points">
              <span><Check /> A personal dashboard for portfolio review</span>
              <span><Check /> Portfolio tools for exploring digital assets</span>
              <span><Check /> Activity history in one organized workspace</span>
            </div>
            <div className="landing-account-switch">
              {authView === 'register' ? <>Already have an account? <button type="button" onClick={() => setAuthView('login')}>Log In <ArrowRight /></button></> : <>New to NEXORA? <button type="button" onClick={() => setAuthView('register')}>Create Account <ArrowRight /></button></>}
            </div>
          </div>
          <div className="landing-auth-card">
            {authView === 'register' && <RegisterPage embedded onNavigateToLogin={() => setAuthView('login')} />}
            {authView === 'login' && <LoginPage embedded onNavigateToRegister={() => setAuthView('register')} onNavigateToForgot={() => setAuthView('forgot')} />}
            {authView === 'forgot' && <ForgotPasswordPage embedded onNavigateToLogin={() => setAuthView('login')} />}
          </div>
        </section>

        <section className="landing-contact landing-section" id="contact">
          <div className="landing-contact-icon"><Mail /></div>
          <div className="landing-contact-copy">
            <div className="landing-eyebrow">WE’RE HERE TO HELP</div>
            <h2>Questions or Inquiries?</h2>
            <p>For any questions, information, or assistance, please contact us by email.</p>
          </div>
          <div className="landing-contact-actions">
            <a href="mailto:alphaprimealphaprime5@gmail.com">alphaprimealphaprime5@gmail.com</a>
            <button type="button" onClick={copyEmail} aria-label="Copy support email"><Copy />{emailCopied ? 'Copied' : 'Copy email'}</button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <a className="landing-brand" href="#home"><LandingMark /><span>NEXORA<small>DIGITAL FINANCE</small></span></a>
        <p>Portfolio tools and modeled market activity</p>
        <a href="#home" className="back-to-top">Back to top <ChevronDown /></a>
      </footer>
    </div>
  );
};
