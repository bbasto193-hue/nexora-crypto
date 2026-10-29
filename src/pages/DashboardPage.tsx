import React, { useState } from 'react';
import { useCrypto, PORTFOLIO_TIER_CONFIG, PortfolioTier } from '../context/CryptoContext';
import { InteractiveChart } from '../components/common/InteractiveChart';
import { Sparkline } from '../components/common/Sparkline';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Plus,
  Coins,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Clock,
  Sparkles,
  Eye,
  EyeOff,
  BarChart2,
  Layers,
  History,
  TrendingUp as TrendingIcon,
  HelpCircle
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onOpenTradeModal: (assetId: string, type?: 'buy' | 'sell') => void;
  onOpenHoldingModal: (assetId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenTradeModal,
  onOpenHoldingModal
}) => {
  const {
    assets,
    holdings,
    cashBalance,
    totalPortfolioValue,
    totalCryptoValue,
    portfolioPnL24hUSD,
    portfolioPnL24hPct,
    portfolioTotalPnLUSD,
    portfolioTotalPnLPct,
    transactions,
    formatCurrency,
    formatCrypto,
    hideBalance,
    toggleHideBalance,
    portfolioTier,
    setPortfolioScale
  } = useCrypto();

  const [timeRange, setTimeRange] = useState('24H');

  const is24hPositive = portfolioPnL24hUSD >= 0;
  const isTotalPositive = portfolioTotalPnLUSD >= 0;

  // Calculate allocation breakdown
  const allocation = holdings
    .map((h) => {
      const asset = assets.find((a) => a.id === h.assetId);
      const value = (asset?.price || 0) * h.amount;
      const pct = totalPortfolioValue > 0 ? (value / totalPortfolioValue) * 100 : 0;
      return {
        ...h,
        asset,
        value,
        pct
      };
    })
    .sort((a, b) => b.value - a.value);

  const cashPct = totalPortfolioValue > 0 ? (cashBalance / totalPortfolioValue) * 100 : 0;
  const recentTx = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome / Status Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/25 to-slate-900/40 border border-cyan-500/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>NOVEXA Management Terminal</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Portfolio overview, digital asset information, and modeled market values.
            </div>
          </div>
        </div>

        {/* Balance Privacy & Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleHideBalance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
            title={hideBalance ? 'Reveal balances' : 'Hide balances'}
          >
            {hideBalance ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>{hideBalance ? 'Show Balances' : 'Mask Balances'}</span>
          </button>

          <button
            onClick={() => onOpenTradeModal('bitcoin', 'buy')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Order</span>
          </button>
        </div>
      </div>

      {/* Main Portfolio Balance Header Card with Large Balance Support */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#0f1523] border border-white/5 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-cyan-400" />
              <span>Total Portfolio Value</span>
              <span className="text-[10px] text-slate-400">({PORTFOLIO_TIER_CONFIG[portfolioTier]?.label})</span>
            </div>

            <div className="flex items-baseline gap-4 mt-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-mono text-white tracking-tight">
                {formatCurrency(totalPortfolioValue)}
              </div>
            </div>

            {/* 24h & All-time Stats */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold ${
                  is24hPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                }`}
              >
                {is24hPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {is24hPositive ? '+' : ''}{portfolioPnL24hPct.toFixed(2)}% (24h)
              </span>

              <span className="text-slate-400">
                {is24hPositive ? '+' : ''}{formatCurrency(portfolioPnL24hUSD)}
              </span>

              <span className="text-slate-400">•</span>

              <span className="text-slate-300">
                All-time PnL:{' '}
                <strong className={isTotalPositive ? 'text-emerald-400' : 'text-rose-400'}>
                  {isTotalPositive ? '+' : ''}{portfolioTotalPnLPct.toFixed(2)}% ({formatCurrency(portfolioTotalPnLUSD)})
                </strong>
              </span>
            </div>
          </div>

          {/* Quick Portfolio Tier Scaler (Supports $2.5M, $85M, $1.25B, $9.8B) */}
          <div className="w-full md:w-auto p-3 rounded-2xl bg-[#090d16] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Portfolio Scale</span>
              <span className="text-[10px] text-cyan-400 font-mono">Quick Scale</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(['starter', 'pro', 'institutional', 'sovereign', 'prime'] as PortfolioTier[]).map((tierKey) => {
                const config = PORTFOLIO_TIER_CONFIG[tierKey];
                const isActive = portfolioTier === tierKey;
                return (
                  <button
                    key={tierKey}
                    onClick={() => setPortfolioScale(tierKey)}
                    className={`px-2 py-1.5 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-md shadow-cyan-950/40'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 text-[11px]'
                    }`}
                    title={config.description}
                  >
                    <div className="text-[10px] font-mono leading-tight">{config.label.split(' ')[0]}</div>
                    <div className="text-[11px] font-bold font-mono">
                      {tierKey === 'starter' && '$100K'}
                      {tierKey === 'pro' && '$2.5M'}
                      {tierKey === 'institutional' && '$85M'}
                      {tierKey === 'sovereign' && '$1.25B'}
                      {tierKey === 'prime' && '$9.8B'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Secondary KPIs: Cash, Crypto Allocation, Positions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/5 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Crypto Assets Value</div>
              <div className="text-base font-bold text-white mt-0.5">{formatCurrency(totalCryptoValue)}</div>
            </div>
            <div className="text-right text-[11px] text-cyan-400 font-semibold">
              {totalPortfolioValue > 0 ? ((totalCryptoValue / totalPortfolioValue) * 100).toFixed(1) : 0}% of portfolio
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Available Liquid Cash (USD)</div>
              <div className="text-base font-bold text-white mt-0.5">{formatCurrency(cashBalance)}</div>
            </div>
            <div className="text-right text-[11px] text-amber-400 font-semibold">
              {cashPct.toFixed(1)}% dry powder
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Active Portfolio Positions</div>
              <div className="text-base font-bold text-white mt-0.5">{holdings.length} Tokens</div>
            </div>
            <button
              onClick={() => onOpenHoldingModal()}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              + Add Asset
            </button>
          </div>
        </div>
      </div>

      {/* Required Section 4.D: Quick Actions Bar */}
      <div className="p-4 rounded-2xl bg-[#0f1523] border border-white/5 shadow-xl">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Quick Workspaces
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => onNavigate('portfolio')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/5 transition-all text-xs font-semibold text-left group"
          >
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 group-hover:bg-cyan-500/25">
              <Wallet className="w-4 h-4" />
            </div>
            <span>View Portfolio</span>
          </button>

          <button
            onClick={() => onNavigate('market')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/5 transition-all text-xs font-semibold text-left group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25">
              <TrendingIcon className="w-4 h-4" />
            </div>
            <span>Explore Markets</span>
          </button>

          <button
            onClick={() => onNavigate('trading')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/5 transition-all text-xs font-semibold text-left group"
          >
            <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25">
              <BarChart2 className="w-4 h-4" />
            </div>
            <span>Trading Terminal</span>
          </button>

          <button
            onClick={() => onNavigate('swap')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/5 transition-all text-xs font-semibold text-left group"
          >
            <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400 group-hover:bg-indigo-500/25">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <span>Swap Assets</span>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/5 transition-all text-xs font-semibold text-left group"
          >
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25">
              <History className="w-4 h-4" />
            </div>
            <span>Transaction History</span>
          </button>
        </div>
      </div>

      {/* Main Charts & Allocation Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Portfolio History Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0f1523] border border-white/5 shadow-xl">
          <InteractiveChart
            baseValue={totalPortfolioValue}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            title="Portfolio Performance"
          />
        </div>

        {/* Right Col: Asset Allocation Breakdown */}
        <div className="p-6 rounded-3xl bg-[#0f1523] border border-white/5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Asset Allocation</h2>
              <button
                onClick={() => onOpenHoldingModal()}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adjust</span>
              </button>
            </div>

            {/* Segmented Visual Allocation Bar */}
            <div className="mt-4">
              <div className="h-3 w-full rounded-full bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
                {allocation.map((item) => (
                  <div
                    key={item.assetId}
                    style={{ width: `${Math.max(item.pct, 3)}%`, backgroundColor: item.asset?.color || '#38bdf8' }}
                    className="h-full rounded-sm transition-all"
                    title={`${item.symbol}: ${item.pct.toFixed(1)}%`}
                  />
                ))}
                <div
                  style={{ width: `${Math.max(cashPct, 3)}%`, backgroundColor: '#eab308' }}
                  className="h-full rounded-sm transition-all"
                  title={`USD Cash: ${cashPct.toFixed(1)}%`}
                />
              </div>
            </div>

            {/* Allocation List */}
            <div className="mt-4 space-y-2 max-h-56 overflow-y-auto pr-1">
              {allocation.map((item) => (
                <div
                  key={item.assetId}
                  className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.asset?.color || '#38bdf8' }}
                    />
                    <span className="font-bold text-white">{item.symbol}</span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[80px]">
                      {item.asset?.name}
                    </span>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-white font-semibold">{formatCurrency(item.value)}</div>
                    <div className="text-[10px] text-slate-400">{item.pct.toFixed(1)}%</div>
                  </div>
                </div>
              ))}

              {/* Cash entry */}
              <div className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="font-bold text-white">USD (Cash)</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-white font-semibold">{formatCurrency(cashBalance)}</div>
                  <div className="text-[10px] text-slate-400">{cashPct.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('portfolio')}
            className="mt-4 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors border border-white/5 flex items-center justify-center gap-1.5"
          >
            <span>View Full Portfolio Details</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Cryptocurrency Market Cards Carousel / Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Cryptocurrency Watchlist</h2>
            <p className="text-xs text-slate-400 mt-0.5">Modeled market prices with local order previews</p>
          </div>
          <button
            onClick={() => onNavigate('market')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Explore All Coins</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {assets.slice(0, 4).map((coin) => {
            const isPos = coin.change24h >= 0;
            return (
              <div
                key={coin.id}
                className="p-4 rounded-2xl bg-[#0f1523] border border-white/5 glass-panel-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: coin.iconBg, color: coin.color }}
                      >
                        {coin.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{coin.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{coin.symbol}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        isPos ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {isPos ? '+' : ''}{coin.change24h.toFixed(2)}%
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-lg font-bold font-mono text-white">
                      ${coin.price.toLocaleString(undefined, { maximumFractionDigits: coin.price > 10 ? 2 : 4 })}
                    </span>
                    <Sparkline data={coin.sparkline} isPositive={isPos} width={80} height={28} />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                  <button
                    onClick={() => onOpenTradeModal(coin.id, 'buy')}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold transition-colors"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => onOpenTradeModal(coin.id, 'sell')}
                    className="flex-1 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold transition-colors"
                  >
                    Sell
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 rounded-3xl bg-[#0f1523] border border-white/5 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Activity
            </h2>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View Full Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-white/5 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Type</th>
                <th className="pb-3">Asset / Details</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Total Value</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {recentTx.map((tx) => {
                const isBuy = tx.type === 'buy' || tx.type === 'receive' || tx.type === 'deposit';
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2 font-sans">
                        <div
                          className={`p-1.5 rounded-lg ${
                            tx.type === 'buy'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : tx.type === 'sell'
                              ? 'bg-rose-500/20 text-rose-400'
                              : tx.type === 'swap'
                              ? 'bg-purple-500/20 text-purple-400'
                              : tx.type === 'send'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-cyan-500/20 text-cyan-400'
                          }`}
                        >
                          {tx.type === 'buy' && <ArrowDownLeft className="w-3.5 h-3.5" />}
                          {tx.type === 'sell' && <ArrowUpRight className="w-3.5 h-3.5" />}
                          {tx.type === 'swap' && <ArrowLeftRight className="w-3.5 h-3.5" />}
                          {tx.type === 'send' && <ArrowUpRight className="w-3.5 h-3.5" />}
                          {tx.type === 'receive' && <ArrowDownLeft className="w-3.5 h-3.5" />}
                          {tx.type === 'deposit' && <Plus className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-bold uppercase text-[11px] text-white">
                          {tx.type}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 font-sans">
                      <div className="font-semibold text-white">
                        {tx.assetSymbol}
                        {tx.counterAssetSymbol && ` → ${tx.counterAssetSymbol}`}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {tx.note || tx.hash}
                      </div>
                    </td>

                    <td className="py-3 text-white font-semibold">
                      {isBuy ? '+' : '-'}{tx.amount} {tx.assetSymbol}
                    </td>

                    <td className="py-3 text-cyan-300 font-semibold">
                      {formatCurrency(tx.totalValueUSD)}
                    </td>

                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Completed
                      </span>
                    </td>

                    <td className="py-3 pr-2 text-right text-slate-400 text-[11px]">
                      {new Date(tx.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
