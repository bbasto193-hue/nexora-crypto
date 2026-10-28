import React, { useState } from 'react';
import { useCrypto } from '../../context/CryptoContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Bell,
  Coins,
  DollarSign,
  ChevronDown,
  Check,
  ShieldCheck,
  ExternalLink,
  Menu,
  X,
  PlusCircle,
  HelpCircle,
  LogOut,
  User
} from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onOpenCommandPalette: () => void;
  onToggleMobileSidebar: () => void;
  onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onOpenCommandPalette,
  onToggleMobileSidebar,
  onNavigate
}) => {
  const {
    settings,
    updateSettings,
    notifications,
    markNotificationRead,
    clearNotifications,
    cashBalance,
    addSimulatedCash,
    formatCurrency,
    assets
  } = useCrypto();
  const { user, logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoInfo, setShowDemoInfo] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const topCoins = assets.slice(0, 4);

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Executive Overview', subtitle: 'Simulated cryptocurrency portfolio & real-time analytics' },
    portfolio: { title: 'Portfolio & Holdings', subtitle: 'Manage simulated cryptocurrency balances and positions' },
    market: { title: 'Market Explorer', subtitle: 'Cryptocurrency market capitalization and simulated dynamics' },
    trading: { title: 'Simulated Exchange', subtitle: 'Simulate buy and sell executions with zero financial risk' },
    swap: { title: 'Token Swap Simulator', subtitle: 'Simulated decentralized liquidity exchange' },
    transfer: { title: 'Send & Receive', subtitle: 'Simulate outbound and inbound blockchain transactions' },
    history: { title: 'Transaction Ledger', subtitle: 'Complete log of simulated trading and wallet activities' },
    analytics: { title: 'Analytics & Reports', subtitle: 'Performance analytics, risk distribution, and export' },
    help: { title: 'Help Center & Academy', subtitle: 'Instructional video tutorial, documentation, and FAQs' },
    settings: { title: 'Platform Settings', subtitle: 'Configure currency, display, notifications, and simulation parameters' }
  };

  const currentInfo = pageTitles[currentPage] || { title: 'Novexa Software', subtitle: 'Cryptocurrency Management Platform' };

  return (
    <header className="sticky top-0 z-30 bg-[#0b0e14]/90 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile Sidebar Trigger + Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
                {currentInfo.title}
              </h1>
            </div>
            <p className="hidden md:block text-xs text-slate-400 mt-1 leading-none">{currentInfo.subtitle}</p>
          </div>
        </div>

        {/* Center: Live Market Ticker Ribbon */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#0e1420] border border-white/5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-2 border-r border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            MARKETS:
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            {topCoins.map((coin) => (
              <div
                key={coin.id}
                onClick={() => onNavigate('market')}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="font-bold text-slate-300">{coin.symbol}</span>
                <span className="text-white">${coin.price.toLocaleString(undefined, { maximumFractionDigits: coin.price > 10 ? 2 : 4 })}</span>
                <span className={`text-[10px] font-bold ${coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search / Command Palette Shortcut */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all text-xs"
            title="Open Command Palette (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline text-slate-400">Search asset or action...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white/10 rounded font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Quick Add Cash */}
          <button
            onClick={() => addSimulatedCash(5000)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all text-xs font-medium cursor-pointer"
            title="Add $5,000 USD to portfolio"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+$5,000</span>
          </button>

          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCurrencyMenu(!showCurrencyMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 border border-white/5 transition-colors"
            >
              <span>{settings.currency}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showCurrencyMenu && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl bg-[#111726] border border-white/10 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95">
                {(['USD', 'EUR', 'GBP', 'JPY'] as const).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => {
                      updateSettings({ currency: curr });
                      setShowCurrencyMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      settings.currency === curr ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{curr}</span>
                    {settings.currency === curr && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowCurrencyMenu(false);
              }}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0b0e14]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-[#111726] border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-400 font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[11px] text-slate-400 hover:text-white transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="mt-3 flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications yet. Simulated activity will appear here.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                          notif.read
                            ? 'bg-white/[0.02] border-white/5 text-slate-400'
                            : 'bg-white/[0.06] border-cyan-500/30 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-white">{notif.title}</span>
                          <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                        </div>
                        <p className="text-xs mt-1 text-slate-300 leading-relaxed">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Help Center Button */}
          <button
            onClick={() => onNavigate('help')}
            className={`p-2 rounded-xl transition-colors ${
              currentPage === 'help'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
            title="Help Center & Instructional Video"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Platform Info Disclaimer Pill */}
          <button
            onClick={() => setShowDemoInfo(true)}
            className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5 transition-colors cursor-pointer"
            title="Platform Information"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Platform Info</span>
          </button>

          {/* User Account & Sign Out Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
                setShowCurrencyMenu(false);
              }}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
              title="User Account"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-[10px] text-white">
                {(user?.name || settings.userName).charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#111726] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                <div className="p-3 border-b border-white/5">
                  <div className="text-xs font-bold text-white truncate">
                    {user?.name || settings.userName}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                    {user?.email || settings.userEmail}
                  </div>
                  <div className="mt-1.5 inline-block text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Institutional Account
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Account Settings</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demo Notice Modal */}
      {showDemoInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111726] border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">NOVEXA Platform Architecture</h3>
              </div>
              <button
                onClick={() => setShowDemoInfo(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">NOVEXA SOFTWARE</strong> is a modern, high-fidelity cryptocurrency management platform and simulation software designed for portfolio modeling, education, and user testing.
              </p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-cyan-400 font-semibold">• Zero Financial Risk:</div>
                <p className="text-[11px] text-slate-400">All balances, transactions, addresses, order books, and swaps are processed within a client-authoritative simulated environment.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-emerald-400 font-semibold">• Persistent State:</div>
                <p className="text-[11px] text-slate-400">Your simulated trades, transfers, and custom holdings persist in your browser so you can monitor simulated portfolio changes across sessions.</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDemoInfo(false)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-cyan-950/40"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
