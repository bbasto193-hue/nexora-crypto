import React, { useState } from 'react';
import {
  HelpCircle,
  Play,
  BookOpen,
  ShieldCheck,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TUTORIAL_CHAPTERS } from '../components/onboarding/OnboardingTutorialModal';

interface HelpCenterPageProps {
  onOpenTutorial: () => void;
  onNavigate: (page: string) => void;
}

export const HelpCenterPage: React.FC<HelpCenterPageProps> = ({
  onOpenTutorial,
  onNavigate
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the simulated trading engine work?',
      a: 'All buy, sell, and swap orders execute against our client-authoritative simulated liquidity engine. Prices reflect realistic simulated movements, and 0.15% broker fees are deducted from your demo cash balance or token proceeds. No real funds or blockchain contracts are touched.'
    },
    {
      q: 'How do Large Portfolio Balances ($2.5M, $85M, $1.25B, $9.8B) work?',
      a: 'Nexora supports institutional balance scales. You can toggle between evaluation tiers (Starter $100K, Pro $2.5M, Institutional $85M, Sovereign $1.25B, and Global Prime $9.8B). The platform scales all crypto holdings and cash reserves proportionally so that individual allocations and sum totals remain 100% mathematically consistent.'
    },
    {
      q: 'Can I simulate inbound and outbound crypto transfers?',
      a: 'Yes. In the Send & Receive simulator, you can generate demonstration QR codes, copy testnet/sandbox deposit addresses, and even trigger simulated inbound liquidity deposits to test wallet workflows without real funds.'
    },
    {
      q: 'Where do I place my custom tutorial MP4 video file?',
      a: 'Place your video at `/videos/nexora-getting-started.mp4` in the project root public directory. The player automatically detects the file and switches from the simulated canvas walkthrough to native MP4 playback.'
    },
    {
      q: 'Are my demonstration balances saved across browser sessions?',
      a: 'Yes. Nexora saves your holdings, custom positions, cash balance, and transaction ledger in encrypted browser local storage so your portfolio modeling persists across sessions.'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Help Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/30 border border-cyan-500/20 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEXORA KNOWLEDGE & TRAINING BASE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Help Center & Training Academy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Master the Nexora Crypto terminal, explore simulator documentation, review video scripts, or replay the interactive onboarding tutorial.
          </p>
        </div>

        {/* Big Replay Tutorial Button */}
        <button
          onClick={onOpenTutorial}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-cyan-950/50 flex items-center gap-2.5 shrink-0 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Launch Onboarding Tutorial Video</span>
        </button>
      </div>

      {/* Tutorial Video Chapters Storyboard */}
      <div className="p-6 rounded-3xl bg-[#0f1523] border border-white/5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Video Course Syllabus & Storyboard
              </h2>
              <p className="text-xs text-slate-400">10 structured modules covering every facet of Nexora</p>
            </div>
          </div>
          <button
            onClick={onOpenTutorial}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Play Full Course</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TUTORIAL_CHAPTERS.map((ch) => (
            <div
              key={ch.id}
              onClick={onOpenTutorial}
              className="p-3.5 rounded-2xl bg-[#0a0e17] border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10">
                  MODULE {ch.id.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{ch.durationSec}s</span>
              </div>
              <h3 className="font-bold text-xs text-white mt-2 group-hover:text-cyan-300 transition-colors">
                {ch.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {ch.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="p-6 rounded-3xl bg-[#0f1523] border border-white/5 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
          <HelpCircle className="w-5 h-5 text-purple-400" />
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-400">Essential answers regarding simulator operations and balances</p>
          </div>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/5 bg-[#0a0e17] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs font-bold text-white hover:text-cyan-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Disclaimer Note */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Educational & Demonstration Scope:</strong> Nexora Crypto is designed for algorithmic strategy testing, UI demonstrations, and portfolio risk modeling. All balances are simulated and cannot be withdrawn to external banking networks.
        </div>
      </div>
    </div>
  );
};
