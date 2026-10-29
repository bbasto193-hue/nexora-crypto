import React, { useState, useMemo } from 'react';
import { useCrypto, PORTFOLIO_TIER_CONFIG, PortfolioTier } from '../context/CryptoContext';
import { Sparkline } from '../components/common/Sparkline';
import {
  Wallet,
  Plus,
  Search,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  DollarSign,
  PieChart,
  Eye,
  EyeOff,
  X,
  ExternalLink,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { CryptoAsset, Holding } from '../types/crypto';

interface PortfolioPageProps {
  onOpenTradeModal: (assetId: string, type?: 'buy' | 'sell') => void;
  onOpenHoldingModal: (assetId?: string) => void;
  onNavigate: (page: string) => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({
  onOpenTradeModal,
  onOpenHoldingModal,
  onNavigate
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
    removeHolding,
    formatCurrency,
    formatCrypto,
    hideBalance,
    toggleHideBalance,
    portfolioTier,
    setPortfolioScale
  } = useCrypto();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'value' | 'name' | 'amount' | 'pnl' | 'change24h'>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<{
    asset: CryptoAsset;
    holding?: Holding;
  } | null>(null);

  // Combine holdings with live asset data
  const processedHoldings = useMemo(() => {
    return holdings
      .map((h) => {
        const asset = assets.find((a) => a.id === h.assetId);
        if (!asset) return null;

        const currentPrice = asset.price;
        const totalValue = currentPrice * h.amount;
        const costBasis = h.averageBuyPrice * h.amount;
        const pnlUSD = totalValue - costBasis;
        const pnlPct = costBasis > 0 ? (pnlUSD / costBasis) * 100 : 0;
        const allocationPct = totalPortfolioValue > 0 ? (totalValue / totalPortfolioValue) * 100 : 0;

        return {
          holding: h,
          asset,
          currentPrice,
          totalValue,
          costBasis,
          pnlUSD,
          pnlPct,
          allocationPct
        };
      })
      .filter(Boolean) as Array<{
      holding: Holding;
      asset: CryptoAsset;
      currentPrice: number;
      totalValue: number;
      costBasis: number;
      pnlUSD: number;
      pnlPct: number;
      allocationPct: number;
    }>;
  }, [holdings, assets, totalPortfolioValue]);

  // Filtering & Sorting
  const filteredHoldings = useMemo(() => {
    const list = processedHoldings.filter((item) => {
      const q = searchQuery.toLowerCase();
      return (
        item.asset.name.toLowerCase().includes(q) ||
        item.asset.symbol.toLowerCase().includes(q) ||
        item.asset.category.toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortField === 'value') {
        valA = a.totalValue;
        valB = b.totalValue;
      } else if (sortField === 'amount') {
        valA = a.holding.amount;
        valB = b.holding.amount;
      } else if (sortField === 'pnl') {
        valA = a.pnlUSD;
        valB = b.pnlUSD;
      } else if (sortField === 'change24h') {
        valA = a.asset.change24h;
        valB = b.asset.change24h;
      } else {
        return sortDirection === 'asc'
          ? a.asset.name.localeCompare(b.asset.name)
          : b.asset.name.localeCompare(a.asset.name);
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return list;
  }, [processedHoldings, searchQuery, sortField, sortDirection]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tier Switcher & Privacy Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0f1523] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Portfolio Scale · Practice:</span>
              <span className="text-cyan-400 font-mono">
                {PORTFOLIO_TIER_CONFIG[portfolioTier].label} ({PORTFOLIO_TIER_CONFIG[portfolioTier].description})
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Proportionally scales practice asset balances and cash reserves.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Privacy Toggle */}
          <button
            onClick={toggleHideBalance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
            title={hideBalance ? "Unhide practice balances" : "Mask practice balances"}
          >
            {hideBalance ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
            <span>{hideBalance ? 'Balances Hidden' : 'Hide Balances'}</span>
          </button>

          {/* Quick Tier Selectors */}
          <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-xl border border-white/5">
            {(Object.keys(PORTFOLIO_TIER_CONFIG) as PortfolioTier[]).map((tierKey) => (
              <button
                key={tierKey}
                onClick={() => setPortfolioScale(tierKey)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all ${
                  portfolioTier === tierKey
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {PORTFOLIO_TIER_CONFIG[tierKey].description}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.04] px-4 py-3 text-[11px] leading-relaxed text-cyan-100/75">
        Portfolio balances, valuations, and returns shown here are practice figures stored in this browser. They are not real funds or verified financial records.
      </p>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f1523] border border-white/5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total Practice Portfolio</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {hideBalance ? '••••••••' : formatCurrency(totalPortfolioValue)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Includes {holdings.length} crypto assets and practice cash
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1523] border border-white/5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total Profit / Loss</span>
            {portfolioTotalPnLUSD >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div
            className={`text-2xl font-bold font-mono mt-2 ${
              portfolioTotalPnLUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {hideBalance ? '••••••••' : `${portfolioTotalPnLUSD >= 0 ? '+' : ''}${formatCurrency(portfolioTotalPnLUSD)}`}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            {portfolioTotalPnLUSD >= 0 ? '+' : ''}{portfolioTotalPnLPct.toFixed(2)}% total return
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1523] border border-white/5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Crypto Holdings Value</span>
            <PieChart className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {hideBalance ? '••••••••' : formatCurrency(totalCryptoValue)}
          </div>
          <div className="text-xs text-cyan-400 mt-1 font-mono">
            {totalPortfolioValue > 0 ? ((totalCryptoValue / totalPortfolioValue) * 100).toFixed(1) : 0}% portfolio allocation
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f1523] border border-white/5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Practice Cash Balance</span>
            <DollarSign className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {hideBalance ? '••••••••' : formatCurrency(cashBalance)}
          </div>
          <div className="text-xs text-yellow-400 mt-1 font-mono">
            {totalPortfolioValue > 0 ? ((cashBalance / totalPortfolioValue) * 100).toFixed(1) : 0}% dry powder reserve
          </div>
        </div>
      </div>

      {/* Table Controls & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0f1523] border border-white/5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search assets by name, symbol, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0e17] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenHoldingModal()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-950/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Edit Holding</span>
          </button>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="rounded-2xl bg-[#0f1523] border border-white/5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0a0e17]/80 text-slate-400 border-b border-white/5 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 pl-4 cursor-pointer hover:text-white" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Asset</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 cursor-pointer hover:text-white" onClick={() => toggleSort('amount')}>
                  <div className="flex items-center gap-1">
                    <span>Quantity</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5">Market Price</th>
                <th className="py-3.5 cursor-pointer hover:text-white" onClick={() => toggleSort('change24h')}>
                  <div className="flex items-center gap-1">
                    <span>24h Trend</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 cursor-pointer hover:text-white" onClick={() => toggleSort('value')}>
                  <div className="flex items-center gap-1">
                    <span>Modeled Value</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 cursor-pointer hover:text-white" onClick={() => toggleSort('pnl')}>
                  <div className="flex items-center gap-1">
                    <span>Practice P&amp;L</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5">Allocation</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 font-mono">
              {filteredHoldings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                    <Wallet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm">No holdings match your query.</p>
                    <button
                      onClick={() => onOpenHoldingModal()}
                      className="mt-3 text-cyan-400 hover:underline text-xs"
                    >
                      Add a practice position
                    </button>
                  </td>
                </tr>
              ) : (
                filteredHoldings.map((item) => {
                  const isPos24h = item.asset.change24h >= 0;
                  const isPosPnL = item.pnlUSD >= 0;

                  return (
                    <tr
                      key={item.holding.assetId}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Asset Column */}
                      <td className="py-4 pl-4 font-sans">
                        <div
                          onClick={() => setSelectedAssetDetail({ asset: item.asset, holding: item.holding })}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs"
                            style={{ backgroundColor: item.asset.iconBg, color: item.asset.color }}
                          >
                            {item.asset.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {item.asset.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {item.asset.symbol}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-4 text-white font-semibold">
                        <div>{hideBalance ? '••••' : item.holding.amount.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Avg: ${item.holding.averageBuyPrice.toLocaleString()}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 text-slate-200">
                        ${item.currentPrice.toLocaleString(undefined, { maximumFractionDigits: item.currentPrice > 10 ? 2 : 4 })}
                      </td>

                      {/* 24h Trend */}
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold text-xs ${
                              isPos24h ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPos24h ? '+' : ''}{item.asset.change24h.toFixed(2)}%
                          </span>
                          <Sparkline data={item.asset.sparkline} isPositive={isPos24h} width={60} height={20} />
                        </div>
                      </td>

                      {/* Simulated Value */}
                      <td className="py-4 text-white font-bold text-sm">
                        {hideBalance ? '••••••••' : formatCurrency(item.totalValue)}
                      </td>

                      {/* Simulated PnL */}
                      <td className="py-4">
                        <div className={`font-semibold ${isPosPnL ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {hideBalance ? '••••••' : `${isPosPnL ? '+' : ''}${formatCurrency(item.pnlUSD)}`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isPosPnL ? '+' : ''}{item.pnlPct.toFixed(2)}%
                        </div>
                      </td>

                      {/* Allocation % */}
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{item.allocationPct.toFixed(1)}%</span>
                          <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full rounded-full bg-cyan-400"
                              style={{ width: `${Math.min(100, item.allocationPct)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 font-sans">
                          <button
                            onClick={() => onOpenTradeModal(item.asset.id, 'buy')}
                            className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-colors"
                            title="Buy more"
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => onOpenTradeModal(item.asset.id, 'sell')}
                            className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors"
                            title="Sell holding"
                          >
                            Sell
                          </button>
                          <button
                            onClick={() => onOpenHoldingModal(item.asset.id)}
                            className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                            title="Edit practice quantity"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Detail Drawer / Modal */}
      {selectedAssetDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111726] border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{
                    backgroundColor: selectedAssetDetail.asset.iconBg,
                    color: selectedAssetDetail.asset.color
                  }}
                >
                  {selectedAssetDetail.asset.symbol.slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedAssetDetail.asset.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedAssetDetail.asset.symbol} • Rank #{selectedAssetDetail.asset.rank}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedAssetDetail.asset.description}
              </p>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Modeled Price</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    ${selectedAssetDetail.asset.price.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">24h Percentage</div>
                  <div
                    className={`text-base font-bold mt-0.5 ${
                      selectedAssetDetail.asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {selectedAssetDetail.asset.change24h >= 0 ? '+' : ''}
                    {selectedAssetDetail.asset.change24h.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Market Capitalization</div>
                  <div className="text-white mt-0.5">
                    ${(selectedAssetDetail.asset.marketCap / 1e9).toFixed(2)}B
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">24h Volume</div>
                  <div className="text-white mt-0.5">
                    ${(selectedAssetDetail.asset.volume24h / 1e9).toFixed(2)}B
                  </div>
                </div>
              </div>

              {selectedAssetDetail.holding && (
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs font-mono space-y-1.5">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    Your Practice Position
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Holding Quantity:</span>
                    <span className="text-white font-bold">
                      {hideBalance ? '••••••••' : `${selectedAssetDetail.holding.amount.toLocaleString()} ${selectedAssetDetail.asset.symbol}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Average Buy Price:</span>
                    <span className="text-white font-bold">
                      ${selectedAssetDetail.holding.averageBuyPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Current Position Value:</span>
                    <span className="text-cyan-300 font-bold">
                      {hideBalance ? '••••••••' : formatCurrency(selectedAssetDetail.holding.amount * selectedAssetDetail.asset.price)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    const id = selectedAssetDetail.asset.id;
                    setSelectedAssetDetail(null);
                    onOpenTradeModal(id, 'buy');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Buy {selectedAssetDetail.asset.symbol}
                </button>
                <button
                  onClick={() => {
                    const id = selectedAssetDetail.asset.id;
                    setSelectedAssetDetail(null);
                    onOpenTradeModal(id, 'sell');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Sell {selectedAssetDetail.asset.symbol}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
