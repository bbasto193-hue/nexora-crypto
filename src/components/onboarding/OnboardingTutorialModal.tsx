import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Subtitles,
  Maximize2,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

export interface TutorialChapter {
  id: number;
  title: string;
  durationSec: number;
  description: string;
  subtitles: string[];
  visualType: 'dashboard' | 'balance' | 'assets' | 'charts' | 'trading' | 'orders' | 'transfer' | 'swap' | 'history' | 'security';
}

export const TUTORIAL_CHAPTERS: TutorialChapter[] = [
  {
    id: 1,
    title: 'Introduction to the Dashboard',
    durationSec: 15,
    description: 'Overview of the Nexora terminal layout, primary metrics, and quick navigation actions.',
    subtitles: [
      'Welcome to Nexora Crypto — your institutional-grade cryptocurrency management suite.',
      'The dashboard gives you real-time visibility into portfolio valuation, 24-hour return, and market trends.'
    ],
    visualType: 'dashboard'
  },
  {
    id: 2,
    title: 'Understanding your portfolio balance',
    durationSec: 18,
    description: 'How simulated valuations, liquid cash reserves, and large balances are tracked.',
    subtitles: [
      'Your simulated balances reflect total holdings valued against simulated market rates plus dry-powder cash.',
      'Nexora supports multi-million and multi-billion institutional portfolio scales with zero rounding discrepancy.'
    ],
    visualType: 'balance'
  },
  {
    id: 3,
    title: 'Exploring cryptocurrency assets',
    durationSec: 16,
    description: 'Discovering Layer-1, DeFi, and stablecoins with circulating supply and market caps.',
    subtitles: [
      'Navigate to the Market Explorer to inspect top assets including Bitcoin, Ethereum, and Solana.',
      'Filter by category, search token symbols, and monitor 24-hour volatility trends.'
    ],
    visualType: 'assets'
  },
  {
    id: 4,
    title: 'Understanding portfolio charts',
    durationSec: 16,
    description: 'Interactive time ranges (24H to ALL), hover crosshairs, and valuation checkpoints.',
    subtitles: [
      'Portfolio charts track historical valuation curves with responsive timeframes from 24 hours to all-time.',
      'Hover anywhere along the curve to inspect simulated price milestones and high-low boundaries.'
    ],
    visualType: 'charts'
  },
  {
    id: 5,
    title: 'Using the trading interface',
    durationSec: 20,
    description: 'Operating the simulated order terminal, live order book depth, and spread indicator.',
    subtitles: [
      'The trading simulator mirrors an institutional order book with real-time bids, asks, and spreads.',
      'Switch between pairs like BTC/USD or SOL/USD to model trade executions.'
    ],
    visualType: 'trading'
  },
  {
    id: 6,
    title: 'Simulated buy and sell operations',
    durationSec: 18,
    description: 'Executing Market and Limit orders with balance checks and fee transparency.',
    subtitles: [
      'Place simulated Market or Limit orders with transparent 0.15% broker fee calculations.',
      'Orders validate against your available simulated cash and update your holdings immediately.'
    ],
    visualType: 'orders'
  },
  {
    id: 7,
    title: 'Using the send and receive demonstration',
    durationSec: 18,
    description: 'Demonstrating outbound transfers and testing inbound deposit workflows with QR codes.',
    subtitles: [
      'The Transfer suite allows testing outbound dispatch to cold storage and simulated recipient addresses.',
      'Generate high-contrast deposit QR codes and simulate inbound liquidity grants.'
    ],
    visualType: 'transfer'
  },
  {
    id: 8,
    title: 'Exploring the swap interface',
    durationSec: 18,
    description: 'Instant automated market maker (AMM) token exchanges with slippage controls.',
    subtitles: [
      'Experience decentralized liquidity swaps between any two supported tokens.',
      'Configure custom slippage tolerances and preview intelligent simulated routing paths.'
    ],
    visualType: 'swap'
  },
  {
    id: 9,
    title: 'Reviewing transaction history',
    durationSec: 16,
    description: 'Filtering, searching, and exporting complete audit receipts to CSV.',
    subtitles: [
      'Every operation is recorded with a simulated transaction hash, fee record, and status chip.',
      'Filter by transaction type, search by hash, and download complete CSV audit statements.'
    ],
    visualType: 'history'
  },
  {
    id: 10,
    title: 'Managing account settings and security',
    durationSec: 17,
    description: 'Customizing display currencies, audio haptics, demo balance resets, and replay.',
    subtitles: [
      'Customize your currency preferences across USD, EUR, GBP, and JPY.',
      'You can replay this tutorial anytime from the Help Center or reset your sandbox data.'
    ],
    visualType: 'security'
  }
];

interface OnboardingTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingTutorialModal: React.FC<OnboardingTutorialModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressSec, setProgressSec] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showChaptersDrawer, setShowChaptersDrawer] = useState(false);
  const [videoSrcExists, setVideoSrcExists] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const activeChapter = TUTORIAL_CHAPTERS[currentChapterIdx];

  // Total duration of all chapters
  const totalDuration = TUTORIAL_CHAPTERS.reduce((sum, ch) => sum + ch.durationSec, 0);

  // Check if a local video file is present at /videos/nexora-getting-started.mp4
  useEffect(() => {
    fetch('/videos/nexora-getting-started.mp4', { method: 'HEAD' })
      .then((res) => {
        if (res.ok) setVideoSrcExists(true);
      })
      .catch(() => {
        setVideoSrcExists(false);
      });
  }, []);

  // Timer loop for simulated animated video playback
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setProgressSec((prev) => {
        const next = prev + 1;
        if (next >= activeChapter.durationSec) {
          // Advance to next chapter if available
          if (currentChapterIdx < TUTORIAL_CHAPTERS.length - 1) {
            setCurrentChapterIdx((idx) => idx + 1);
            return 0;
          } else {
            // End of tutorial
            setIsPlaying(false);
            return activeChapter.durationSec;
          }
        }
        return next;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, activeChapter.durationSec, currentChapterIdx, playbackSpeed]);

  if (!isOpen) return null;

  const handleSelectChapter = (idx: number) => {
    setCurrentChapterIdx(idx);
    setProgressSec(0);
    setIsPlaying(true);
    soundManager.playClick(true);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    soundManager.playClick(true);
  };

  const handleWatchAgain = () => {
    setCurrentChapterIdx(0);
    setProgressSec(0);
    setIsPlaying(true);
  };

  const currentSubtitle =
    activeChapter.subtitles[
      Math.floor((progressSec / activeChapter.durationSec) * activeChapter.subtitles.length)
    ] || activeChapter.subtitles[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b0f19] border border-cyan-500/25 rounded-2xl sm:rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#0d1322]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Welcome to NEXORA CRYPTO — Getting Started
              </h2>
              <p className="text-[11px] text-slate-400">
                Interactive platform walkthrough • Chapter {currentChapterIdx + 1} of {TUTORIAL_CHAPTERS.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChaptersDrawer(!showChaptersDrawer)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors hidden sm:flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Chapters</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player & Canvas Container */}
        <div className="relative flex-1 bg-black flex flex-col justify-center items-center overflow-hidden min-h-[300px] sm:min-h-[400px]">
          {videoSrcExists ? (
            <video
              ref={videoRef}
              src="/videos/nexora-getting-started.mp4"
              className="w-full h-full object-contain"
              autoPlay
              controls={false}
            />
          ) : (
            /* Interactive Animated Simulation Visualizer */
            <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-between items-center relative select-none bg-gradient-to-b from-[#070b14] via-[#090f1d] to-[#060911]">
              {/* Subtle grid backdrop */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(rgba(56, 189, 248, 0.4) 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />

              {/* Top Badge */}
              <div className="relative z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>NEXORA TUTORIAL SIMULATION ENGINE</span>
              </div>

              {/* Dynamic Chapter Visual Animation */}
              <div className="relative z-10 text-center space-y-3 max-w-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 border border-cyan-500/40 shadow-xl shadow-cyan-950/50">
                  <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {activeChapter.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {activeChapter.description}
                </p>

                {/* Simulated Visual Widget depending on chapter */}
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-xs text-left max-w-md mx-auto space-y-1.5 shadow-inner">
                  {activeChapter.visualType === 'balance' && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400">SIMULATED PORTFOLIO VALUATION</div>
                      <div className="text-lg font-bold text-emerald-400">$85,000,000.00 USD</div>
                      <div className="text-[10px] text-slate-400">Institutional Tier • 0% Slippage Delta</div>
                    </div>
                  )}
                  {activeChapter.visualType === 'trading' && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400">TERMINAL ORDER DEPTH</div>
                      <div className="flex justify-between text-rose-400 text-[11px]">
                        <span>ASK $68,460.00</span> <span>1.42 BTC</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 text-[11px]">
                        <span>BID $68,450.00</span> <span>2.80 BTC</span>
                      </div>
                    </div>
                  )}
                  {activeChapter.visualType === 'swap' && (
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400">SMART LIQUIDITY ROUTING</div>
                      <div className="text-xs text-white">ETH (1.50) → NEXORA POOL → SOL (29.82)</div>
                      <div className="text-[10px] text-purple-400">DEX Fee: 0.2% • Guaranteed Fill</div>
                    </div>
                  )}
                  {activeChapter.visualType !== 'balance' &&
                    activeChapter.visualType !== 'trading' &&
                    activeChapter.visualType !== 'swap' && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400">SYSTEM ARCHITECTURE</div>
                        <div className="text-xs text-cyan-300">Nexora Institutional Sandbox v2.4</div>
                        <div className="text-[10px] text-slate-400">Zero real blockchain transactions involved</div>
                      </div>
                    )}
                </div>
              </div>

              {/* Subtitles Overlay */}
              {showSubtitles && (
                <div className="relative z-10 max-w-xl mx-auto px-4 py-2 rounded-xl bg-black/80 border border-white/10 text-center shadow-lg">
                  <p className="text-xs sm:text-sm text-cyan-200 font-medium leading-relaxed">
                    "{currentSubtitle}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Video Player Floating Bottom Control Bar */}
          <div className="w-full bg-[#0d1322]/95 border-t border-white/10 px-4 py-2.5 flex flex-col gap-2 relative z-20">
            {/* Scrubber Progress Bar */}
            <div className="w-full flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 w-10 text-right">
                {Math.floor(progressSec / 60)}:{(progressSec % 60).toString().padStart(2, '0')}
              </span>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  setProgressSec(Math.floor(pos * activeChapter.durationSec));
                }}
                className="flex-1 h-2 bg-slate-800 rounded-full cursor-pointer relative overflow-hidden group"
              >
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all rounded-full"
                  style={{ width: `${(progressSec / activeChapter.durationSec) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 w-10">
                {Math.floor(activeChapter.durationSec / 60)}:
                {(activeChapter.durationSec % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Playback Controls Row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePlay}
                  className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-950/40"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <button
                  disabled={currentChapterIdx === 0}
                  onClick={() => handleSelectChapter(currentChapterIdx - 1)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Previous Chapter"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  disabled={currentChapterIdx === TUTORIAL_CHAPTERS.length - 1}
                  onClick={() => handleSelectChapter(currentChapterIdx + 1)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next Chapter"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <span className="text-xs text-white font-semibold ml-2 truncate max-w-[200px] sm:max-w-xs">
                  {activeChapter.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Playback Speed */}
                <button
                  onClick={() => {
                    const speeds = [1.0, 1.25, 1.5];
                    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                    setPlaybackSpeed(speeds[nextIdx]);
                  }}
                  className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 font-bold"
                  title="Playback Speed"
                >
                  {playbackSpeed}x
                </button>

                {/* Subtitles Toggle */}
                <button
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showSubtitles ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Subtitles"
                >
                  <Subtitles className="w-4 h-4" />
                </button>

                {/* Mute Toggle */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleWatchAgain}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  title="Watch from Beginning"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Drawer (Toggled or accessible) */}
        {showChaptersDrawer && (
          <div className="border-t border-white/10 p-3 bg-[#0d1322] max-h-48 overflow-y-auto space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
              Select Chapter
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {TUTORIAL_CHAPTERS.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => handleSelectChapter(idx)}
                  className={`flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                    currentChapterIdx === idx
                      ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <span className="truncate">
                    {ch.id}. {ch.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 ml-2 shrink-0">
                    {ch.durationSec}s
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#0d1322] border-t border-white/10">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              External video asset expected at{' '}
              <code className="text-cyan-300 font-mono">/videos/nexora-getting-started.mp4</code>.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onComplete();
              }}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
            >
              Skip Tutorial
            </button>
            <button
              onClick={() => {
                onClose();
                onComplete();
              }}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
