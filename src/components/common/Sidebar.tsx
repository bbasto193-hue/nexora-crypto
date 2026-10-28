import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  BarChart2,
  ArrowLeftRight,
  SendHorizontal,
  History,
  PieChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Shield,
  Zap,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { useCrypto } from '../../context/CryptoContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile
}) => {
  const { cashBalance, formatCurrency, addSimulatedCash, settings } = useCrypto();
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet, badge: null },
    { id: 'market', label: 'Markets', icon: TrendingUp, badge: 'LIVE' },
    { id: 'trading', label: 'Trading', icon: BarChart2, badge: 'PRO' },
    { id: 'swap', label: 'Swap', icon: ArrowLeftRight, badge: null },
    { id: 'transfer', label: 'Send & Receive', icon: SendHorizontal, badge: null },
    { id: 'history', label: 'Transaction History', icon: History, badge: null },
    { id: 'analytics', label: 'Analytics', icon: PieChart, badge: null },
    { id: 'help', label: 'Help Center', icon: HelpCircle, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#0b0e14] border-r border-white/5 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            {/* Nexora Emblem Logo */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 border border-cyan-500/30 group-hover:border-cyan-400/60 transition-all shadow-lg shadow-cyan-950/30">
              <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
                <path
                  d="M16 3L27.2583 9.5V22.5L16 29L4.74167 22.5V9.5L16 3Z"
                  stroke="url(#nexoraLogoGrad)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 20L16 11L21 20M13.5 16H18.5"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="16" cy="11" r="2" fill="#10b981" />
                <defs>
                  <linearGradient id="nexoraLogoGrad" x1="4" y1="3" x2="28" y2="29">
                    <stop stopColor="#38bdf8" />
                    <stop offset="0.5" stopColor="#6366f1" />
                    <stop offset="1" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-wider text-white">
                  NOVEXA
                </span>
                <span className="text-[10px] font-semibold text-cyan-400 tracking-wider">SOFTWARE</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-xs transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/10 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-950/20 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}

                {!collapsed && item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                      item.badge === 'LIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Left Active Glow Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Simulated Cash Card Widget (when expanded) */}
        {!collapsed && (
          <div className="p-3 mx-3 mb-3 rounded-2xl bg-[#0f1522] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Simulated Cash</span>
              <button
                onClick={() => addSimulatedCash(2500)}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 font-bold"
                title="Top-up $2,500 demo funds"
              >
                <Plus className="w-3 h-3" /> $2.5K
              </button>
            </div>
            <div className="font-mono text-base font-bold text-white tracking-tight">
              {formatCurrency(cashBalance)}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
              <Shield className="w-3 h-3" />
              <span>Available for paper trading</span>
            </div>
          </div>
        )}

        {/* Bottom Profile / Environment Status */}
        <div className="p-3 border-t border-white/5 space-y-2">
          <div
            onClick={() => handleNavClick('settings')}
            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md shrink-0">
              <span>{(user?.name || settings.userName).charAt(0).toUpperCase()}</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0b0e14]" />
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.name || settings.userName}
                </div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 font-mono">
                  <span>{user?.email || settings.userEmail}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          {!collapsed ? (
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 text-xs font-medium transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
