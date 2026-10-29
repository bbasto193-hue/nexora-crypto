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
      q: 'How do practice orders work?',
      a: 'Buy, sell, and swap actions update locally stored practice balances using modeled prices and fee calculations. They are not sent to an exchange, do not move real funds, and do not create blockchain transactions.'
    },
    {
      q: 'How do Large Portfolio Balances ($2.5M, $85M, $1.25B, $9.8B) work?',
      a: 'You can choose a portfolio scale (Starter $100K, Pro $2.5M, Institutional $85M, Sovereign $1.25B, or Global Prime $9.8B). These are practice figures; changing scale adjusts the locally modeled holdings and cash proportionally.'
    },
    {
      q: 'Can I send or receive cryptocurrency?',
      a: 'No. Send & Receive provides local practice workflows only. Addresses and QR codes shown in that area are not verified deposit destinations; no transaction is submitted and no real assets are credited. Never send cryptocurrency to an address displayed there.'
    },
    {
      q: 'Where can I access the product walkthrough?',
      a: 'Open the interactive walkthrough from this page or from Platform Settings. It introduces the dashboard, portfolio tools, practice trading, and account preferences.'
    },
    {
      q: 'Are my account balances saved across browser sessions?',
      a: 'Practice holdings, balances, preferences, and activity are stored in this browser. Browser storage is not encrypted server storage or a secure backup; clear site data or device access may affect privacy and availability.'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Help Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/30 border border-cyan-500/20 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEXORA LEARNING CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Help & Learning Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Explore platform features and replay the interactive product walkthrough.
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
                Walkthrough Chapters
              </h2>
                <p className="text-xs text-slate-400">10 concise modules introducing the NEXORA workspace</p>
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
            <p className="text-xs text-slate-400">Answers about portfolio tools, practice activity, and account data</p>
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
          <strong className="text-white">Practice activity and data:</strong> NEXORA stores modeled balances and activity in this browser. No real funds are held or transferred, and no blockchain or banking transactions are submitted.
        </div>
      </div>
    </div>
  );
};
