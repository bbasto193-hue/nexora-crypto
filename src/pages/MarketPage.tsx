import React, { useState, useMemo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Sparkline } from '../components/common/Sparkline';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  BarChart3,
  Layers,
  Zap,
  Activity,
  ArrowUpDown,
  ExternalLink,
  Info
} from 'lucide-react';
import { AssetCategory, CryptoAsset } from '../types/crypto';

interface MarketPageProps {
  onOpenTradeModal: (assetId: string, type?: 'buy' | 'sell') => void;
  onNavigate: (page: string) => void;
}

export const MarketPage: React.FC<MarketPageProps> = ({ onOpenTradeModal, onNavigate }) => {
  const { assets, settings, updateSettings, formatCurrency } = useCrypto();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewFilter, setViewFilter] = useState<'all' | 'gainers' | 'losers'>('all');
  const [sortKey, setSortKey] = useState<'rank' | 'price' | 'change24h' | 'marketCap' | 'volume24h'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Categories list
  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'layer1', label: 'Layer 1' },
    { id: 'defi', label: 'DeFi' },
    { id: 'layer2', label: 'Layer 2' },
    { id: 'infrastructure', label: 'Infrastructure' },
    { id: 'stablecoin', label: 'Stablecoins' }
  ];

  // Filtering
  const filteredAssets = useMemo(() => {
    return assets
      .filter((a) => {
        const matchesSearch =
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.symbol.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;

        const matchesView =
          viewFilter === 'all' ||
          (viewFilter === 'gainers' && a.change24h > 0) ||
          (viewFilter === 'losers' && a.change24h < 0);

        return matchesSearch && matchesCat && matchesView;
      })
      .sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        if (sortOrder === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [assets, searchQuery, selectedCategory, viewFilter, sortKey, sortOrder]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder(key === 'rank' ? 'asc' : 'desc');
    }
  };

  // Market Macro Stats (Simulated)
  const totalMarketCap = assets.reduce((sum, a) => sum + a.marketCap, 0);
  const total24hVolume = assets.reduce((sum, a) => sum + a.volume24h, 0);
  const btcDominance = ((assets.find((a) => a.symbol === 'BTC')?.marketCap || 0) / (totalMarketCap || 1)) * 100;

  return (
    <div className="space-y-6">
      {/* Top Simulated Market Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0f1523] border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Simulated Total Crypto Market Cap
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              ${(totalMarketCap / 1e12).toFixed(2)} Trillion
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1523] border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              24h Simulated Volume
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              ${(total24hVolume / 1e9).toFixed(2)} Billion
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f1523] border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Bitcoin Dominance
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {btcDominance.toFixed(1)}%
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#0f1523] border border-white/5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by coin name or symbol (e.g. BTC, Solana)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0e17] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Quick Filter: All, Gainers, Losers + AutoTick Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#0a0e17] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setViewFilter('gainers')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewFilter === 'gainers' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Gainers
              </button>
              <button
                onClick={() => setViewFilter('losers')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewFilter === 'losers' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Losers
              </button>
            </div>

            {/* Simulated Live Ticks Switch */}
            <button
              onClick={() => updateSettings({ autoTick: !settings.autoTick })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                settings.autoTick
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
              title="Toggle simulated dynamic market price fluctuations"
            >
              <span className={`w-2 h-2 rounded-full ${settings.autoTick ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
              <span>Sim Ticks: {settings.autoTick ? 'ON' : 'PAUSED'}</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Market Assets Table */}
      <div className="rounded-2xl bg-[#0f1523] border border-white/5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0a0e17]/80 text-slate-400 border-b border-white/5 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 pl-4 cursor-pointer hover:text-white" onClick={() => toggleSort('rank')}>
                  <div className="flex items-center gap-1">
                    <span>#</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5">Name</th>
                <th className="py-3.5 cursor-pointer hover:text-white" onClick={() => toggleSort('price')}>
                  <div className="flex items-center gap-1">
                    <span>Simulated Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 cursor-pointer hover:text-white" onClick={() => toggleSort('change24h')}>
                  <div className="flex items-center gap-1">
                    <span>24h Change</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 cursor-pointer hover:text-white hidden md:table-cell" onClick={() => toggleSort('volume24h')}>
                  <div className="flex items-center gap-1">
                    <span>24h Volume</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 cursor-pointer hover:text-white" onClick={() => toggleSort('marketCap')}>
                  <div className="flex items-center gap-1">
                    <span>Market Cap</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 hidden sm:table-cell">Last 24 Hours</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 font-mono">
              {filteredAssets.map((asset) => {
                const isPos = asset.change24h >= 0;
                return (
                  <tr
                    key={asset.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-4 pl-4 text-slate-400 font-bold">
                      {asset.rank}
                    </td>

                    <td className="py-4 font-sans">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs"
                          style={{ backgroundColor: asset.iconBg, color: asset.color }}
                        >
                          {asset.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {asset.name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                            <span>{asset.symbol}</span>
                            <span>•</span>
                            <span className="capitalize">{asset.category}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 text-white font-bold text-sm">
                      ${asset.price.toLocaleString(undefined, { maximumFractionDigits: asset.price > 10 ? 2 : 4 })}
                    </td>

                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isPos ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPos ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-4 text-slate-300 hidden md:table-cell">
                      ${(asset.volume24h / 1e9).toFixed(2)}B
                    </td>

                    <td className="py-4 text-slate-300">
                      ${(asset.marketCap / 1e9).toFixed(2)}B
                    </td>

                    <td className="py-4 hidden sm:table-cell">
                      <Sparkline data={asset.sparkline} isPositive={isPos} width={100} height={28} />
                    </td>

                    <td className="py-4 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          onClick={() => onOpenTradeModal(asset.id, 'buy')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-xs transition-colors"
                        >
                          Trade
                        </button>
                        <button
                          onClick={() => onNavigate('trading')}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          title="Open in Full Terminal"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer footer */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          Market data displayed is generated by Nexora's simulation engine for testing, training, and strategy modeling. Prices are not financial advice.
        </span>
      </div>
    </div>
  );
};
