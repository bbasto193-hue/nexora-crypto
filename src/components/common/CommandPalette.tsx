import React, { useState, useEffect } from 'react';
import { useCrypto } from '../../context/CryptoContext';
import {
  Search,
  LayoutDashboard,
  Wallet,
  TrendingUp,
  BarChart2,
  ArrowLeftRight,
  SendHorizontal,
  History,
  PieChart,
  Settings,
  PlusCircle,
  RotateCcw,
  Download,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onOpenTradeModal?: (assetId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenTradeModal
}) => {
  const { assets, addSimulatedCash, resetAllDemoData, exportPortfolioCSV } = useCrypto();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filtered Navigation Actions
  const basePages = [
    { label: 'Go to Dashboard', page: 'dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { label: 'Go to Portfolio & Assets', page: 'portfolio', icon: Wallet, category: 'Navigation' },
    { label: 'Explore Crypto Markets', page: 'market', icon: TrendingUp, category: 'Navigation' },
    { label: 'Open Trading', page: 'trading', icon: BarChart2, category: 'Navigation' },
    { label: 'Open Token Swap', page: 'swap', icon: ArrowLeftRight, category: 'Navigation' },
    { label: 'Open Send & Receive', page: 'transfer', icon: SendHorizontal, category: 'Navigation' },
    { label: 'View Transaction History', page: 'history', icon: History, category: 'Navigation' },
    { label: 'Open Analytics & Reports', page: 'analytics', icon: PieChart, category: 'Navigation' },
    { label: 'Open Help Center & Academy', page: 'help', icon: Settings, category: 'Navigation' },
    { label: 'Open Settings', page: 'settings', icon: Settings, category: 'Navigation' }
  ];

  const quickActions = [
    {
      label: 'Add +$5,000 Practice USD',
      icon: PlusCircle,
      category: 'Practice Actions',
      action: () => {
        addSimulatedCash(5000);
        onClose();
      }
    },
    {
      label: 'Download Portfolio CSV Report',
      icon: Download,
      category: 'Practice Actions',
      action: () => {
        exportPortfolioCSV();
        onClose();
      }
    },
    {
      label: 'Restore Initial Portfolio State',
      icon: RotateCcw,
      category: 'Practice Actions',
      action: () => {
        if (window.confirm('Restore practice balances, transactions, and settings to the initial portfolio state?')) {
          resetAllDemoData();
          onClose();
        }
      }
    }
  ];

  const filteredAssets = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.symbol.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPages = basePages.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()));
  const filteredQuickActions = quickActions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111726] border border-white/10 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a coin (e.g. BTC, Solana) or action..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white/10 rounded font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Crypto Assets Section */}
          {filteredAssets.length > 0 && (
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 tracking-wider">
                Cryptocurrencies
              </div>
              <div className="space-y-1">
                {filteredAssets.slice(0, 5).map((coin) => (
                  <div
                    key={coin.id}
                    onClick={() => {
                      if (onOpenTradeModal) {
                        onOpenTradeModal(coin.id);
                      } else {
                        onNavigate('trading');
                      }
                      onClose();
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: coin.iconBg, color: coin.color }}
                      >
                        {coin.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-cyan-300">
                          {coin.name} <span className="text-slate-400 font-normal">({coin.symbol})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">{coin.category}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-semibold text-white">
                        ${coin.price.toLocaleString(undefined, { maximumFractionDigits: coin.price > 10 ? 2 : 4 })}
                      </div>
                      <div
                        className={`text-[10px] font-mono font-medium ${
                          coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {filteredQuickActions.length > 0 && (
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 tracking-wider">
                Practice Actions
              </div>
              <div className="space-y-1">
                {filteredQuickActions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Pages */}
          {filteredPages.length > 0 && (
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 tracking-wider">
                Pages & Workspaces
              </div>
              <div className="space-y-1">
                {filteredPages.map((page, idx) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onNavigate(page.page);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-left text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-white/5 text-slate-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{page.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredAssets.length === 0 &&
            filteredPages.length === 0 &&
            filteredQuickActions.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No matching results found for "{query}".
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
