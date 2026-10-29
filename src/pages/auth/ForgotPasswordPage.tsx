import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
  embedded?: boolean;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateToLogin,
  embedded = false
}) => {
  const { requestReset, completeReset } = useAuth();

  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [tokenCode, setTokenCode] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setFormError('');

    if (!email.trim()) {
      setEmailError('Email address is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    const result = await requestReset(email);
    setIsSubmitting(false);

    if (result.success && result.token) {
      setGeneratedToken(result.token);
      setTokenCode(result.token); // Pre-fill the locally generated recovery code
      setStep('reset');
    } else {
      setFormError(result.error || 'No account found with this email address.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!tokenCode.trim()) {
      setFormError('Please enter the recovery security code.');
      return;
    }

    if (newPassword.length < 8) {
      setFormError('New password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await completeReset(email, tokenCode, newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setStep('success');
    } else {
      setFormError(result.error || 'Failed to update password. Please check the code.');
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <AuthLayout embedded={embedded}>
      {/* Main Container */}
      <div className="w-full max-w-sm space-y-6">
        {/* Card */}
        <div className="auth-form-card space-y-4">
          {step === 'request' && (
            <>
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">Password Recovery</h2>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleRequestToken} className="space-y-4" noValidate>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      placeholder="Enter your account email"
                      className={`w-full bg-[#090d16] border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors ${
                        emailError
                          ? 'border-rose-500/60 focus:border-rose-500'
                          : 'border-white/10 focus:border-cyan-500/60'
                      }`}
                    />
                  </div>
                  {emailError && (
                    <div className="text-[11px] text-rose-400 mt-1 font-medium">{emailError}</div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-400">
                  A recovery code will be generated in this browser to reset your password. It will not be sent by email.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Creating Recovery Code...' : 'Create Recovery Code'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Set New Password</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter your recovery code and choose a new account password
                </p>
              </div>

              {/* Generated Token Notification Card */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300">Your Recovery Code:</span>
                  <button
                    type="button"
                    onClick={copyToken}
                    className="text-[10px] text-cyan-400 hover:text-white flex items-center gap-1 font-mono font-bold"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-base font-bold text-white tracking-wider">
                  {generatedToken}
                </div>
                <div className="text-[10px] text-slate-400">
                  This code is generated and stored locally; it is not emailed. It expires in 15 minutes.
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Recovery Code
                  </label>
                  <input
                    type="text"
                    value={tokenCode}
                    onChange={(e) => setTokenCode(e.target.value)}
                    placeholder="NX-..."
                    className="w-full bg-[#090d16] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    New Password (Min 8 Characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="w-full bg-[#090d16] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/10">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Password Updated Successfully</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Your new credentials have been hashed and saved with client-side salting.
                </p>
              </div>

              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/40 cursor-pointer"
              >
                Sign In With New Password
              </button>
            </div>
          )}

          {/* Back to Sign In Link */}
          <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/10">
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
