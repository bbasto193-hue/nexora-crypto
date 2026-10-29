import React, { useEffect, useState } from 'react';
import { useCrypto, PORTFOLIO_TIER_CONFIG, PortfolioTier } from '../context/CryptoContext';
import { useAuth } from '../context/AuthContext';
import { SUBSCRIPTION_DURATION_DAYS, SUBSCRIPTION_PLANS } from '../services/subscriptionPlans';
import {
  User,
  Sliders,
  DollarSign,
  Bell,
  Volume2,
  VolumeX,
  RotateCcw,
  PlusCircle,
  Shield,
  Check,
  AlertTriangle,
  Zap,
  Save,
  LogOut,
  Play,
  HelpCircle,
  Info,
  ShieldCheck,
  Layers,
  Mail,
  Clock3,
  CalendarDays,
  CircleDollarSign,
  Copy,
  CheckCircle2
} from 'lucide-react';

const SUBSCRIPTION_DURATION_MS = SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000;
const SUPPORT_EMAIL = 'alphaprimealphaprime5@gmail.com';

const formatPlanUsd = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);

const formatCountdown = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

interface SettingsPageProps {
  onOpenTutorial?: () => void;
  onNavigate?: (page: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onOpenTutorial,
  onNavigate
}) => {
  const {
    settings,
    updateSettings,
    resetAllDemoData,
    addSimulatedCash,
    formatCurrency,
    addToast,
    portfolioTier,
    setPortfolioScale,
    hideBalance,
    toggleHideBalance,
    subscriptionState,
    activateSubscription
  } = useCrypto();
  const { user, logout, updateProfile } = useAuth();

  const [userName, setUserName] = useState(user?.name || settings.userName);
  const [userEmail, setUserEmail] = useState(user?.email || settings.userEmail);
  const [customGrantStr, setCustomGrantStr] = useState('25000');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [supportEmailCopied, setSupportEmailCopied] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const subscriptionCountdown = subscriptionState.activatedAt === null
    ? null
    : formatCountdown(SUBSCRIPTION_DURATION_MS - (currentTime - subscriptionState.activatedAt));

  const handleActivatePlan = (planId: number) => {
    const currentPlan = SUBSCRIPTION_PLANS.find((plan) => plan.id === subscriptionState.activePlanId);
    if (subscriptionState.activatedAt !== null) {
      const currentPlanLabel = currentPlan ? `Plan ${currentPlan.id}` : 'the current plan';
      if (!window.confirm(`Restart Plan ${planId} from day one? The current ${currentPlanLabel} practice balance and counter will reset. Earlier illustrative credit entries remain in the schedule history. Wallet and transaction data will not change.`)) {
        return;
      }
    }

    if (activateSubscription(planId)) {
      addToast('success', `Plan ${planId} practice schedule started`, 'The 34-day illustrative credit schedule has restarted. Earlier entries remain in the schedule history.');
    } else {
      addToast('error', 'Activation Not Saved', 'The subscription activation could not be saved. Please try again.');
    }
  };

  const handleCopySupportEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setSupportEmailCopied(true);
      window.setTimeout(() => setSupportEmailCopied(false), 2000);
    } catch {
      addToast('error', 'Copy Unavailable', 'Select the email address and copy it manually.');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = updateProfile({
      name: userName,
      email: userEmail,
      username: user?.username,
      profilePictureDataUrl: user?.profilePictureDataUrl
    });
    if (!saved) {
      addToast('error', 'Profile Not Saved', 'Check that your name and email are valid and that the email is not already in use.');
      return;
    }
    updateSettings({ userName: userName.trim(), userEmail: userEmail.trim().toLowerCase() });
    addToast('success', 'Profile Updated', 'Your personal account profile was saved in this browser.');
  };

  const handleAddPracticeFunds = () => {
    const val = parseFloat(customGrantStr);
    if (!isNaN(val) && val > 0) {
      addSimulatedCash(val);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Settings Header */}
      <div className="p-4 rounded-2xl bg-[#0f1523] border border-white/5">
        <h2 className="font-bold text-base text-white">Account Settings & Preferences</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Customize reporting currency, portfolio scale, audio feedback, walkthrough, and account preferences
        </p>
      </div>

      {/* Practice subscription schedules; credits are isolated from portfolio funds */}
      <section className="space-y-5" aria-labelledby="subscription-plans-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Practice schedule
            </div>
            <h3 id="subscription-plans-title" className="text-lg font-bold text-white">Subscription Plans</h3>
            <p className="mt-1 text-xs text-slate-400">Illustrative credits are tracked separately and are not wallet funds. No payment is verified or processed here.</p>
          </div>
          {subscriptionState.activatedAt !== null && subscriptionCountdown && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-2.5 text-xs text-emerald-200" aria-live="polite">
              <div className="mb-1 flex items-center gap-1.5 font-semibold"><Clock3 className="h-3.5 w-3.5" /> Plan {subscriptionState.activePlanId} time remaining</div>
              {subscriptionCountdown.days === 0 && subscriptionCountdown.hours === 0 && subscriptionCountdown.minutes === 0 && subscriptionCountdown.seconds === 0
                ? 'Completed'
                : `${subscriptionCountdown.days}d ${String(subscriptionCountdown.hours).padStart(2, '0')}h ${String(subscriptionCountdown.minutes).padStart(2, '0')}m ${String(subscriptionCountdown.seconds).padStart(2, '0')}s`}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isActive = plan.id === subscriptionState.activePlanId && subscriptionState.activatedAt !== null;
            return (
              <article key={plan.id} className={`relative flex min-w-0 flex-col overflow-hidden rounded-2xl border p-5 shadow-xl ${plan.id === 1 ? 'border-cyan-500/40 bg-gradient-to-b from-cyan-950/30 to-[#0f1523]' : 'border-white/10 bg-[#0f1523]'}`}>
                {plan.id === 1 && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400" />}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Plan {plan.id}</p>
                    <h4 className="mt-1 text-sm font-semibold text-white">Plan {plan.id} practice schedule</h4>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${isActive ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300'}`}>
                    {isActive ? 'Schedule running' : 'Available'}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Configured plan price</p>
                  <p className="mt-1 font-mono text-3xl font-bold tracking-tight text-white">{formatPlanUsd(plan.priceUsd)}</p>
                </div>

                <div className="my-5 rounded-xl border border-cyan-500/15 bg-[#090e18]/75 p-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Illustrative daily credit</p>
                  <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-cyan-300">{formatPlanUsd(plan.dailyCreditUsd)}</p>
                  <p className="mt-1 text-[10px] text-slate-500">Illustrative schedule · not funds</p>
                </div>

                <dl className="mb-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-3 text-slate-400">
                    <dt className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-slate-500" />Duration</dt>
                    <dd className="font-semibold text-slate-200">{SUBSCRIPTION_DURATION_DAYS} days</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-slate-400">
                    <dt className="flex items-center gap-2"><CircleDollarSign className="h-3.5 w-3.5 text-slate-500" />Total illustrative credits</dt>
                    <dd className="font-mono font-bold text-white">{formatPlanUsd(plan.totalCreditUsd)}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={() => handleActivatePlan(plan.id)}
                  className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-950/30 transition hover:from-cyan-400 hover:to-blue-500"
                >
                  {isActive ? <><CheckCircle2 className="h-4 w-4" /> Restart schedule</> : `Start practice schedule`}
                </button>
              </article>
            );
          })}
        </div>

        {subscriptionState.activatedAt !== null && (
          <div className="rounded-2xl border border-white/10 bg-[#0f1523] p-5 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Plan {subscriptionState.activePlanId} illustrative schedule balance</h4>
                <p className="mt-1 text-[11px] text-slate-400">Practice-only figures, separate from portfolio cash, holdings, wallet actions, and trading history.</p>
              </div>
              <div className="font-mono text-2xl font-bold text-emerald-300">{formatPlanUsd(subscriptionState.simulatedBalance)}</div>
            </div>
            <div className="mt-4 border-t border-white/5 pt-4">
              <h5 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Subscription credit history</h5>
              {subscriptionState.history.length === 0 ? (
                <p className="text-xs text-slate-500">The first illustrative credit is scheduled 24 hours after the practice schedule starts.</p>
              ) : (
                <ul className="space-y-2">
                  {subscriptionState.history.slice(0, 5).map((entry) => (
                    <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-slate-300">Plan {entry.planId} · Day {entry.day} · Illustrative credit</span>
                      <span className="flex items-center gap-3">
                        <time className="text-slate-500" dateTime={new Date(entry.creditedAt).toISOString()}>{new Date(entry.creditedAt).toLocaleString()}</time>
                        <strong className="font-mono text-emerald-300">+{formatPlanUsd(entry.amount)}</strong>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/30 to-[#0f1523] p-5 shadow-xl" aria-labelledby="contact-support-title">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-2.5 text-blue-300"><Mail className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <h3 id="contact-support-title" className="text-sm font-bold text-white">Contact &amp; Support</h3>
              <p className="mt-1 text-xs text-slate-400">For subscription questions, contact support by email.</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a className="break-all text-sm font-semibold text-cyan-300 underline decoration-cyan-500/40 underline-offset-4 hover:text-cyan-200" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                <button type="button" onClick={handleCopySupportEmail} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 transition hover:bg-white/[0.08]" aria-label="Copy support email address">
                  {supportEmailCopied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                  {supportEmailCopied ? 'Copied' : 'Copy email'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </section>

      {/* Tutorial Replay Card (Requested in Section 3 & 11) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/30 border border-cyan-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Interactive Tutorial
            </span>
          </div>
          <h3 className="font-bold text-base text-white">
            Welcome to NEXORA CRYPTO — Getting Started Video
          </h3>
          <p className="text-xs text-slate-300">
            Replay the complete 10-chapter instructional onboarding walkthrough anytime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-950/40 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Launch Video Tutorial</span>
            </button>
          )}

          {onNavigate && (
            <button
              onClick={() => onNavigate('help')}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-colors"
            >
              Help Center
            </button>
          )}
        </div>
      </div>

      {/* Portfolio Scale Tier Card ($2.5M, $85M, $1.25B, $9.8B) */}
      <div className="p-6 rounded-3xl bg-[#0f1523] border border-white/5 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Large Portfolio Balances & Tier Scaling</h3>
            <p className="text-xs text-slate-400">
              Scale evaluation models to multi-million and multi-billion institutional sizes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {(['starter', 'pro', 'institutional', 'sovereign', 'prime'] as PortfolioTier[]).map((tierKey) => {
            const config = PORTFOLIO_TIER_CONFIG[tierKey];
            const isSelected = portfolioTier === tierKey;
            return (
              <button
                key={tierKey}
                type="button"
                onClick={() => setPortfolioScale(tierKey)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-500/20 to-blue-600/20 border-cyan-500/50 text-white shadow-lg shadow-cyan-950/40'
                    : 'bg-[#0a0e17] border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                }`}
              >
                <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                  {tierKey}
                </div>
                <div className="text-sm font-bold font-mono text-white mt-1">
                  {tierKey === 'starter' && '$100,000'}
                  {tierKey === 'pro' && '$2,500,000'}
                  {tierKey === 'institutional' && '$85,000,000'}
                  {tierKey === 'sovereign' && '$1,250,000,000'}
                  {tierKey === 'prime' && '$9,800,000,000'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                  {config.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-6 rounded-3xl bg-[#0f1523] border border-white/5 shadow-xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Profile & Identity</h3>
            <p className="text-xs text-slate-400">Your personal account profile</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Current Session</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-950/40 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Currency & Display Preferences */}
      <div className="p-6 rounded-3xl bg-[#0f1523] border border-white/5 shadow-xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Display & Currency Settings</h3>
            <p className="text-xs text-slate-400">Set primary reporting currency and interface density</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Default Reporting Currency
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(
                [
                  { code: 'USD', label: 'US Dollar ($)' },
                  { code: 'EUR', label: 'Euro (€)' },
                  { code: 'GBP', label: 'British Pound (£)' },
                  { code: 'JPY', label: 'Japanese Yen (¥)' }
                ] as const
              ).map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => updateSettings({ currency: curr.code })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.currency === curr.code
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/30'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs">{curr.code}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{curr.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-3">
            {/* Balance Masking Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Hide Portfolio Balances by Default</div>
                <div className="text-[11px] text-slate-400">
                  Mask balance figures with privacy asterisks until clicked
                </div>
              </div>
              <button
                type="button"
                onClick={toggleHideBalance}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  hideBalance ? 'bg-cyan-500 justify-end' : 'bg-white/10 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>

            {/* Live Ticks Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Dynamic Market Fluctuation Engine</div>
                <div className="text-[11px] text-slate-400">
                  Simulate realistic micro-price movements every few seconds
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ autoTick: !settings.autoTick })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.autoTick ? 'bg-cyan-500 justify-end' : 'bg-white/10 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>

            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Web Audio Interaction Feedback</div>
                <div className="text-[11px] text-slate-400">
                  Subtle audio cues during practice trades and swaps
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.soundEnabled ? 'bg-cyan-500 justify-end' : 'bg-white/10 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Practice funds and reset controls */}
      <div className="p-6 rounded-3xl bg-[#0f1523] border border-white/5 shadow-xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Practice Funds & Reset</h3>
            <p className="text-xs text-slate-400">Add illustrative funds or restore the initial portfolio state</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Custom Cash Grant */}
          <div className="p-4 rounded-xl bg-[#0a0e17] border border-white/5 space-y-2">
            <div className="text-xs font-bold text-white">Add Practice Funds</div>
            <div className="text-[11px] text-slate-400">
              Add illustrative liquidity to explore larger order sizes
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400">$</span>
                <input
                  type="number"
                  value={customGrantStr}
                  onChange={(e) => setCustomGrantStr(e.target.value)}
                  className="w-full bg-[#111726] border border-white/10 rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAddPracticeFunds}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-emerald-950/40 cursor-pointer"
              >
                Add Practice USD
              </button>
            </div>
          </div>

          {/* Reset All Data Button */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div>
              <div className="text-xs font-bold text-rose-300">Restore Initial Portfolio State</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Restores the initial holdings, practice schedule, starting balances, and transaction history.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#111726] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Confirm Reset</h3>
                <p className="text-xs text-slate-400">Restore the initial portfolio state</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action will reset your practice balances, holdings, and transaction history to the initial portfolio state. Are you sure you want to proceed?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  resetAllDemoData();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-950/40 cursor-pointer"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
