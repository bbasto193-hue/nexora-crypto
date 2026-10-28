import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { InteractiveChart } from '../components/common/InteractiveChart';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Shield,
  Layers,
  ArrowUpRight,
  FileSpreadsheet,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
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
    exportPortfolioCSV,
    formatCurrency,
    settings,
    hideBalance,
    portfolioTier
  } = useCrypto();

  const [timeRange, setTimeRange] = useState('1M');
  const [showReportModal, setShowReportModal] = useState(false);

  // Asset allocation array
  const allocation = holdings.map((h) => {
    const asset = assets.find((a) => a.id === h.assetId);
    const value = (asset?.price || 0) * h.amount;
    const costBasis = h.averageBuyPrice * h.amount;
    const pnl = value - costBasis;
    const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    const pct = totalPortfolioValue > 0 ? (value / totalPortfolioValue) * 100 : 0;
    return {
      ...h,
      asset,
      value,
      costBasis,
      pnl,
      pnlPct,
      pct
    };
  }).sort((a, b) => b.value - a.value);

  const cashPct = totalPortfolioValue > 0 ? (cashBalance / totalPortfolioValue) * 100 : 0;

  // Best & Worst Performers
  const bestPerformer = [...allocation].sort((a, b) => b.pnlPct - a.pnlPct)[0];
  const worstPerformer = [...allocation].sort((a, b) => a.pnlPct - b.pnlPct)[0];

  // Concentration risk score:
  // If top 2 assets > 70%, High concentration; 40-70% Moderate; <40% Diversified
  const top2Pct = (allocation[0]?.pct || 0) + (allocation[1]?.pct || 0);
  const riskLevel =
    top2Pct > 70
      ? { label: 'Concentrated', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' }
      : top2Pct > 40
      ? { label: 'Moderate Diversification', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' }
      : { label: 'Well Balanced', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="p-4 rounded-2xl bg-[#0f1523] border border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-base text-white">Portfolio Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional metrics, risk concentration, and asset performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-purple-400" />
            <span>Generate Executive Summary</span>
          </button>
          <button
            onClick={exportPortfolioCSV}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-950/40 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f1523] border border-white/5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Unrealized Return
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-2 ${
              portfolioTotalPnLUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {hideBalance ? '••••••••' : `${portfolioTotalPnLUSD >= 0 ? '+' : ''}${formatCurrency(portfolioTotalPnLUSD)}`}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            {portfolioTotalPnLUSD >= 0 ? '+' : ''}{portfolioTotalPnLPct.toFixed(2)}% vs purchase price
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1523] border border-white/5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Portfolio Diversification
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${riskLevel.color}`}>
              {riskLevel.label}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-mono">
            Top 2 assets represent {top2Pct.toFixed(1)}% of value
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1523] border border-white/5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Top Performer
          </div>
          <div className="text-lg font-bold text-white mt-2 flex items-center justify-between">
            <span>{bestPerformer?.symbol || 'N/A'}</span>
            <span className="text-emerald-400 font-mono text-sm">
              +{bestPerformer?.pnlPct.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Profit: {hideBalance ? '••••••' : `+${formatCurrency(bestPerformer?.pnl || 0)}`}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1523] border border-white/5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Laggard Position
          </div>
          <div className="text-lg font-bold text-white mt-2 flex items-center justify-between">
            <span>{worstPerformer?.symbol || 'N/A'}</span>
            <span
              className={`font-mono text-sm ${
                (worstPerformer?.pnlPct || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(worstPerformer?.pnlPct || 0) >= 0 ? '+' : ''}{worstPerformer?.pnlPct.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Diff: {hideBalance ? '••••••' : formatCurrency(worstPerformer?.pnl || 0)}
          </div>
        </div>
      </div>

      {/* Historical Performance Chart */}
      <div className="p-6 rounded-2xl bg-[#0f1523] border border-white/5 shadow-xl">
        <InteractiveChart
          baseValue={totalPortfolioValue}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          title="Portfolio Growth Trajectory"
        />
      </div>

      {/* Asset-by-Asset Comparison Table */}
      <div className="p-6 rounded-2xl bg-[#0f1523] border border-white/5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Asset Comparison & Performance Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual position performance against cost basis
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#0a0e17]/80 text-slate-400 border-b border-white/5 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 pl-3">Asset</th>
                <th className="py-3">Quantity</th>
                <th className="py-3">Avg Cost</th>
                <th className="py-3">Market Price</th>
                <th className="py-3">Position Value</th>
                <th className="py-3">Simulated P&L</th>
                <th className="py-3">Return (%)</th>
                <th className="py-3 pr-3">Portfolio Share</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {allocation.map((item) => {
                const isPos = item.pnl >= 0;
                return (
                  <tr key={item.assetId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pl-3 font-sans font-bold text-white flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.asset?.color || '#38bdf8' }}
                      />
                      <span>{item.symbol}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({item.asset?.name})
                      </span>
                    </td>

                    <td className="py-3.5 text-white font-semibold">
                      {hideBalance ? '••••' : item.amount.toLocaleString()}
                    </td>

                    <td className="py-3.5 text-slate-300">
                      ${item.averageBuyPrice.toLocaleString()}
                    </td>

                    <td className="py-3.5 text-slate-200">
                      ${item.asset?.price.toLocaleString()}
                    </td>

                    <td className="py-3.5 text-cyan-300 font-bold">
                      {hideBalance ? '••••••••' : formatCurrency(item.value)}
                    </td>

                    <td className="py-3.5">
                      <span className={`font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {hideBalance ? '••••••' : `${isPos ? '+' : ''}${formatCurrency(item.pnl)}`}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          isPos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {isPos ? '+' : ''}{item.pnlPct.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3.5 pr-3 text-white font-semibold">
                      {item.pct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}

              {/* Cash Entry */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 pl-3 font-sans font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span>USD (Cash)</span>
                </td>
                <td className="py-3.5 text-white font-semibold">{hideBalance ? '••••••••' : cashBalance.toLocaleString()}</td>
                <td className="py-3.5 text-slate-300">$1.00</td>
                <td className="py-3.5 text-slate-200">$1.00</td>
                <td className="py-3.5 text-cyan-300 font-bold">{hideBalance ? '••••••••' : formatCurrency(cashBalance)}</td>
                <td className="py-3.5 text-slate-400">$0.00</td>
                <td className="py-3.5 text-slate-400">0.00%</td>
                <td className="py-3.5 pr-3 text-white font-semibold">{cashPct.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Executive Summary Printable Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#111726] border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Simulated Portfolio Statement</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto font-mono text-xs text-slate-300">
              <div className="flex justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="font-bold text-sm text-white font-sans">NEXORA CRYPTO SUITE</div>
                  <div className="text-[11px] text-slate-400">Client: {settings.userName}</div>
                  <div className="text-[11px] text-slate-400">Account Tier: Institutional Sandbox</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">REPORT DATE</div>
                  <div className="text-cyan-400">{new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 space-y-2">
                <div className="flex justify-between font-bold text-sm text-white">
                  <span>TOTAL ESTIMATED PORTFOLIO VALUE:</span>
                  <span className="text-cyan-400">{formatCurrency(totalPortfolioValue)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Unrealized Simulated Return:</span>
                  <span className={portfolioTotalPnLUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {portfolioTotalPnLUSD >= 0 ? '+' : ''}{formatCurrency(portfolioTotalPnLUSD)} ({portfolioTotalPnLPct.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Simulated Liquid Cash:</span>
                  <span className="text-white">{formatCurrency(cashBalance)} ({cashPct.toFixed(1)}%)</span>
                </div>
              </div>

              <div>
                <div className="font-bold text-white mb-2 font-sans">Holdings Inventory</div>
                <div className="space-y-1">
                  {allocation.map((item) => (
                    <div key={item.assetId} className="flex justify-between py-1 border-b border-white/5 text-[11px]">
                      <span>{item.amount} {item.symbol}</span>
                      <span className="text-white">{formatCurrency(item.value)} ({item.pct.toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300 font-sans">
                DISCLAIMER: This statement was produced in Nexora's mock simulation environment for educational modeling. All values are non-custodial and not certified accounting records.
              </div>
            </div>

            <div className="p-4 border-t border-white/5 flex justify-end gap-3 font-sans">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-200 transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
              <button
                onClick={() => {
                  exportPortfolioCSV();
                  setShowReportModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white transition-all shadow-md shadow-cyan-950/40 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
