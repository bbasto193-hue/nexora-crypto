import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, Camera, CircleDollarSign, Clock3, Eye, EyeOff, FileImage, ShieldCheck, Trash2, UserRound, Wallet, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCrypto } from '../context/CryptoContext';
import { getSubscriptionPlan, SUBSCRIPTION_DURATION_DAYS } from '../services/subscriptionPlans';
import { ProfileAvatar } from '../components/common/ProfileAvatar';
import { PassportDraft, validatePassportDates } from '../services/passportValidation';
import { formatTransactionStatus } from '../utils/transactionPresentation';

const MAX_PROFILE_IMAGE_BYTES = 500_000;
const MAX_PASSPORT_IMAGE_BYTES = 5_000_000;
const EMPTY_PASSPORT_DRAFT: PassportDraft = {
  holderName: '',
  number: '',
  nationality: '',
  dateOfBirth: '',
  issueDate: '',
  expirationDate: '',
  issuingCountry: ''
};

const formatDate = (timestamp?: string | number | null) => {
  if (timestamp === undefined || timestamp === null || timestamp === '') return 'Not provided';
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? 'Not provided' : date.toLocaleString();
};

const formatUsd = (amount: number) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
}).format(amount);

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const {
    cashBalance,
    holdings,
    transactions,
    totalPortfolioValue,
    getAssetById,
    subscriptionState,
    updateSettings
  } = useCrypto();

  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [country, setCountry] = useState(user?.country ?? '');
  const [nationality, setNationality] = useState(user?.nationality ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [picture, setPicture] = useState(user?.profilePictureDataUrl ?? '');
  const [pictureDirty, setPictureDirty] = useState(false);
  const [passport, setPassport] = useState<PassportDraft>(EMPTY_PASSPORT_DRAFT);
  const [passportDocuments, setPassportDocuments] = useState<Array<{ name: string; url: string }>>([]);
  const [passportNumberVisible, setPassportNumberVisible] = useState(false);
  const [passportMessage, setPassportMessage] = useState('');
  const [passportError, setPassportError] = useState('');
  const passportDocumentUrls = useRef<string[]>([]);

  useEffect(() => () => {
    passportDocumentUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!user) {
    return <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#0f1523] p-6 text-sm text-slate-400">No signed-in profile is available.</div>;
  }

  const onPictureSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setError('');
    setMessage('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setError('Choose an image smaller than 500 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPicture(reader.result);
        setPictureDirty(true);
      }
      else setError('The selected image could not be read.');
    };
    reader.onerror = () => setError('The selected image could not be read.');
    reader.readAsDataURL(file);
  };

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    const saved = updateProfile({
      name,
      email,
      username,
      country,
      nationality,
      phone,
      profilePictureDataUrl: picture || null
    });
    if (!saved) {
      setError('Profile could not be saved. Check that the name and email are valid and that the email is not already in use.');
      return;
    }
    updateSettings({ userName: name.trim(), userEmail: email.trim().toLowerCase() });
    setPictureDirty(false);
    setMessage('Profile saved in this browser. It is not backed up to a server.');
  };

  const cancelProfileEdits = () => {
    setName(user.name);
    setUsername(user.username ?? '');
    setEmail(user.email);
    setCountry(user.country ?? '');
    setNationality(user.nationality ?? '');
    setPhone(user.phone ?? '');
    setPicture(user.profilePictureDataUrl ?? '');
    setPictureDirty(false);
    setError('');
    setMessage('Changes discarded.');
  };

  const selectPassportDocuments = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    setPassportError('');
    setPassportMessage('');
    if (!files.length) return;
    if (files.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
      setPassportError('Passport previews accept JPG, PNG, or WebP images only.');
      return;
    }
    if (files.some((file) => file.size > MAX_PASSPORT_IMAGE_BYTES)) {
      setPassportError('Each passport image must be smaller than 5 MB.');
      return;
    }
    const next = files.slice(0, 2).map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    passportDocumentUrls.current.forEach((url) => URL.revokeObjectURL(url));
    passportDocumentUrls.current = next.map((document) => document.url);
    setPassportDocuments(next);
  };

  const clearPassportDraft = () => {
    setPassport(EMPTY_PASSPORT_DRAFT);
    passportDocumentUrls.current.forEach((url) => URL.revokeObjectURL(url));
    passportDocumentUrls.current = [];
    setPassportDocuments([]);
    setPassportNumberVisible(false);
    setPassportError('');
    setPassportMessage('Session-only passport draft cleared.');
  };

  const reviewPassportDraft = (event: React.FormEvent) => {
    event.preventDefault();
    setPassportError('');
    setPassportMessage('');
    const dateError = validatePassportDates(passport);
    if (dateError) {
      setPassportError(dateError);
      return;
    }
    setPassportMessage('Draft is valid and remains in this page session only. It has not been saved to browser storage or a server.');
  };

  const activePlan = subscriptionState.activePlanId === null
    ? undefined
    : getSubscriptionPlan(subscriptionState.activePlanId);
  const simulatedScheduleEnd = subscriptionState.activatedAt === null
    ? null
    : subscriptionState.activatedAt + SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="rounded-2xl border border-white/5 bg-[#0f1523] p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Personal account</p>
        <h2 className="mt-2 text-xl font-bold text-white">My Profile</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">This profile belongs to the currently signed-in account. Profile data is stored locally in this browser.</p>
      </header>

      <section className="rounded-2xl border border-white/5 bg-[#0f1523] p-5 sm:p-6" aria-labelledby="personal-details-title">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <ProfileAvatar name={user.name} picture={picture} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-lg font-bold text-white" />
          <div className="min-w-0 flex-1">
            <h3 id="personal-details-title" className="text-sm font-bold text-white">Personal details</h3>
            <p className="mt-1 truncate text-xs text-slate-400">{user.id}</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.08]">
            <Camera className="h-4 w-4 text-cyan-300" />
            <span>{picture ? 'Replace picture' : 'Upload picture'}</span>
            <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={onPictureSelected} />
          </label>
          {picture && <button type="button" onClick={() => { setPicture(''); setPictureDirty(true); }} className="inline-flex items-center gap-1 rounded-xl border border-rose-500/20 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /> Remove</button>}
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-[11px] font-semibold text-slate-400">Full name
              <input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0e17] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-500/50" />
            </label>
            <label className="text-[11px] font-semibold text-slate-400">Username
              <input maxLength={40} value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Not provided" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0e17] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-500/50" />
            </label>
            <label className="text-[11px] font-semibold text-slate-400">Email address
              <input required type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0e17] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-500/50" />
            </label>
            <label className="text-[11px] font-semibold text-slate-400">Phone / contact
              <input type="tel" maxLength={40} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Not provided" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0e17] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-500/50" />
            </label>
            <label className="text-[11px] font-semibold text-slate-400">Country
              <input maxLength={80} value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Not provided" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0e17] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-500/50" />
            </label>
            <label className="text-[11px] font-semibold text-slate-400">Nationality
              <input maxLength={80} value={nationality} onChange={(event) => setNationality(event.target.value)} placeholder="Not provided" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0e17] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-500/50" />
            </label>
          </div>
          {pictureDirty && <p className="text-[11px] text-cyan-200">Picture preview changed. Save profile to apply it to the header and sidebar.</p>}
          {(error || message) && <p role={error ? 'alert' : 'status'} className={`text-xs ${error ? 'text-rose-300' : 'text-emerald-300'}`}>{error || message}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-950/30 hover:from-cyan-400 hover:to-blue-500">Save profile</button>
            <button type="button" onClick={cancelProfileEdits} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/[0.05]">Cancel changes</button>
          </div>
        </form>

        <dl className="mt-6 grid gap-3 border-t border-white/5 pt-5 text-xs sm:grid-cols-2">
          <div><dt className="text-slate-500">Account created</dt><dd className="mt-1 text-slate-200">{formatDate(user.createdAt)}</dd></div>
          <div><dt className="text-slate-500">Last login</dt><dd className="mt-1 text-slate-200">{formatDate(user.lastLogin)}</dd></div>
          <div><dt className="text-slate-500">Account status</dt><dd className="mt-1 text-slate-200">Not provided</dd></div>
          <div><dt className="text-slate-500">Verification status</dt><dd className="mt-1 text-slate-200">Not provided</dd></div>
        </dl>
      </section>

      <section className="rounded-2xl border border-amber-400/20 bg-[#0f1523] p-5 sm:p-6" aria-labelledby="passport-information-title">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-2.5 text-amber-200"><ShieldCheck className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <h3 id="passport-information-title" className="text-sm font-bold text-white">Passport Information</h3>
            <p className="mt-1 text-[11px] text-slate-400">No passport details currently stored.</p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-rose-400/25 bg-rose-400/[0.06] p-3 text-[11px] leading-relaxed text-rose-100/85">
          This frontend has no encrypted server storage. Passport fields and document previews are held only in this page's memory, are not saved to localStorage, and disappear when you leave or refresh this page. Do not enter real passport details here. Nothing is sent externally.
        </div>

        <form onSubmit={reviewPassportDraft} className="space-y-4" autoComplete="off">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-[11px] font-semibold text-slate-400">Passport holder full name
              <input autoComplete="off" maxLength={120} value={passport.holderName} onChange={(event) => setPassport({ ...passport, holderName: event.target.value })} placeholder="Not provided" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0e17] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-500/50" />
            </label>
            <label className="text-[11px] font-semibold text-slate-400">Passport number
              <span className="relative mt-1.5 block">
                <input autoComplete="off" maxLength={40} type={passportNumberVisible ? 'text' : 'password'} value={passport.number} onChange={(event) => setPassport({ ...passport, number: event.target.value })} placeholder="Not provided" className="w-full rounded-xl border border-white/10 bg-[#0a0e17] px-3.5 py-3 pr-12 text-sm text-white outline-none focus:border-cyan-500/50" />
                <button type="button" className="absolute inset-y-0 right-2 px-2 text-slate-400 hover:text-white" onClick={() => setPassportNumberVisible(!passportNumberVisible)} aria-label={passportNumberVisible ? 'Mask passport number' : 'Show passport number'}>{passportNumberVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </span>
            </label>
            <label className="text-[11px] font-semibold text-slate-400">Nationality
              <input autoComplete="off" maxLength={80} value={passport.nationality} onChange={(event) => setPassport({ ...passport, nationality: event.target.value })} placeholder="Not provided" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0e17] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-500/50" />
            </label>
            <label className="text-[11px] font-semibold text-slate-400">Date of birth
              <input autoComplete="off" type="date" value={passport.dateOfBirth} onChange={(event) => setPassport({ ...passport, dateOfBirth: event.target.value })} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0e17] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-500/50" />
            </label>
            <label className="text-[11px] font-semibold text-slate-400">Issue date
              <input autoComplete="off" type="date" value={passport.issueDate} onChange={(event) => setPassport({ ...passport, issueDate: event.target.value })} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0e17] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-500/50" />
            </label>
            <label className="text-[11px] font-semibold text-slate-400">Expiration date
              <input autoComplete="off" type="date" value={passport.expirationDate} onChange={(event) => setPassport({ ...passport, expirationDate: event.target.value })} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0e17] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-500/50" />
            </label>
            <label className="text-[11px] font-semibold text-slate-400 sm:col-span-2">Issuing country
              <input autoComplete="off" maxLength={80} value={passport.issuingCountry} onChange={(event) => setPassport({ ...passport, issuingCountry: event.target.value })} placeholder="Not provided" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0a0e17] px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-500/50" />
            </label>
          </div>

          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.08]">
              <FileImage className="h-4 w-4 text-amber-200" /> Select document images (JPG, PNG, WebP · up to 5 MB each)
              <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={selectPassportDocuments} />
            </label>
            {passportDocuments.length > 0 && <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {passportDocuments.map((document) => <figure key={document.url} className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0e17] p-2">
                <img src={document.url} alt="Temporary passport document preview" className="max-h-56 w-full rounded-lg object-contain" />
                <figcaption className="mt-2 truncate text-[10px] text-slate-400">Temporary preview: {document.name}</figcaption>
                <button type="button" onClick={() => { URL.revokeObjectURL(document.url); setPassportDocuments(passportDocuments.filter((item) => item.url !== document.url)); }} className="absolute right-3 top-3 rounded-full bg-black/70 p-1.5 text-white" aria-label={`Remove preview ${document.name}`}><X className="h-4 w-4" /></button>
              </figure>)}
            </div>}
          </div>

          {(passportError || passportMessage) && <p role={passportError ? 'alert' : 'status'} className={`text-xs ${passportError ? 'text-rose-300' : 'text-amber-100'}`}>{passportError || passportMessage}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-2.5 text-xs font-semibold text-amber-100 hover:bg-amber-300/15">Validate draft in this session</button>
            <button type="button" onClick={clearPassportDraft} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/[0.05]">Clear passport draft</button>
          </div>
        </form>
      </section>

      <section className="grid min-w-0 gap-5 lg:grid-cols-2" aria-label="Subscription and wallet overview">
        <article className="min-w-0 rounded-2xl border border-white/5 bg-[#0f1523] p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" /><h3 className="text-sm font-bold text-white">Subscription</h3></div>
          <p className="mb-4 rounded-lg border border-amber-400/15 bg-amber-400/[0.05] p-3 text-[11px] leading-relaxed text-amber-100/80">Practice schedule only. This browser-stored schedule is not a paid subscription; payment is not recorded or verified, and no external access is granted.</p>
          <dl className="space-y-3 text-xs">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Configured plan</dt><dd className="text-right text-slate-200">{activePlan ? `${activePlan.name} · Practice` : 'Not selected'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Configured price</dt><dd className="text-slate-200">{activePlan ? formatUsd(activePlan.priceUsd) : 'Not provided'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Practice schedule</dt><dd className="text-slate-200">{subscriptionState.activatedAt !== null ? 'Running · practice only' : 'Not started'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Selection date</dt><dd className="text-right text-slate-200">Not recorded</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Payment instructions</dt><dd className="text-right text-slate-200">Displayed on public page only</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Payment submitted</dt><dd className="text-right text-amber-200">Not recorded</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Payment verified</dt><dd className="text-right text-amber-200">Not recorded</dd></div>
            <div className="flex justify-between gap-3"><dt className="flex items-center gap-1 text-slate-500"><CalendarDays className="h-3.5 w-3.5" />Practice start</dt><dd className="text-right text-slate-200">{formatDate(subscriptionState.activatedAt)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="flex items-center gap-1 text-slate-500"><Clock3 className="h-3.5 w-3.5" />Practice schedule end</dt><dd className="text-right text-slate-200">{formatDate(simulatedScheduleEnd)}</dd></div>
          </dl>
        </article>

        <article className="min-w-0 rounded-2xl border border-white/5 bg-[#0f1523] p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2"><Wallet className="h-4 w-4 text-cyan-300" /><h3 className="text-sm font-bold text-white">Wallet &amp; portfolio</h3></div>
          <p className="mb-4 rounded-lg border border-cyan-500/15 bg-cyan-500/[0.05] p-3 text-[11px] text-cyan-100/75">All wallet, portfolio, and transaction values below are practice records stored in this browser—not real funds or verified blockchain activity.</p>
          <dl className="space-y-3 text-xs">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Practice cash (USD)</dt><dd className="font-mono text-slate-200">{formatUsd(cashBalance)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Estimated practice portfolio</dt><dd className="font-mono text-slate-200">{formatUsd(totalPortfolioValue)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Holdings tracked</dt><dd className="text-slate-200">{holdings.length}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Ledger entries</dt><dd className="text-slate-200">{transactions.length} practice records</dd></div>
          </dl>
          <div className="mt-4 border-t border-white/5 pt-4">
            <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400"><CircleDollarSign className="h-3.5 w-3.5" />Recent practice activity</h4>
            {transactions.length === 0 ? <p className="text-xs text-slate-500">No activity recorded.</p> : (
              <ul className="space-y-2">
                {transactions.slice(0, 4).map((transaction) => (
                  <li key={transaction.id} className="flex items-start justify-between gap-3 text-[11px]">
                    <span className="min-w-0 text-slate-300">{transaction.type} · {transaction.assetSymbol}<span className="mt-0.5 block truncate text-[10px] text-slate-500">{formatTransactionStatus(transaction.status)} · {transaction.hash || 'No reference'}</span></span>
                    <time className="shrink-0 text-right text-slate-500">{formatDate(transaction.timestamp)}</time>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {holdings.length > 0 && <p className="mt-4 border-t border-white/5 pt-3 text-[10px] leading-relaxed text-slate-500">{holdings.slice(0, 4).map((holding) => `${getAssetById(holding.assetId)?.symbol ?? holding.symbol}: ${holding.amount}`).join(' · ')}</p>}
        </article>
      </section>

      <aside className="rounded-2xl border border-white/5 bg-[#0f1523] p-4 text-[11px] leading-relaxed text-slate-400">
        <UserRound className="mr-1 inline h-3.5 w-3.5 text-cyan-300" /> This application stores profile, settings, subscription schedule, and portfolio data in this browser. It is not secure server storage or a backup. Do not store sensitive identity documents here.
      </aside>
    </div>
  );
};
