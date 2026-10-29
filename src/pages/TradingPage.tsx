import React, { useState, useMemo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { InteractiveChart } from '../components/common/InteractiveChart';
import {
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Sliders,
  DollarSign
} from 'lucide-react';
import { CryptoAsset } from '../types/crypto';

interface TradingPageProps {
  onNavigate: (page: string) => void;
}

export const TradingPage: React.FC<TradingPageProps> = ({ onNavigate }) => {
  const { assets, holdings, cashBalance, executeTrade, formatCurrency } = useCrypto();

  const [selectedAssetId, setSelectedAssetId] = useState<string>('bitcoin');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amountStr, setAmountStr] = useState('');
  const [limitPriceStr, setLimitPriceStr] = useState('');
  const [inputMode, setInputMode] = useState<'usd' | 'crypto'>('usd');
  const [chartTimeframe, setChartTimeframe] = useState('24H');
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const currentAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];
  const holding = holdings.find((h) => h.assetId === selectedAssetId);
  const availableCrypto = holding ? holding.amount : 0;

  // Set default limit price when asset changes
  const activePrice = orderType === 'limit' && parseFloat(limitPriceStr) > 0
    ? parseFloat(limitPriceStr)
    : currentAsset.price;

  const numericInput = parseFloat(amountStr) || 0;
  const amountCrypto = inputMode === 'crypto' ? numericInput : numericInput / (activePrice || 1);
  const totalValueUSD = amountCrypto * activePrice;
  const feeUSD = +(totalValueUSD * 0.0015).toFixed(2); // 0.15% fee
  const netTotalUSD = side === 'buy' ? totalValueUSD + feeUSD : totalValueUSD - feeUSD;

  // Quick percentage shortcuts
  const handlePercent = (pct: number) => {
    setErrorMessage('');
    if (side === 'buy') {
      const budget = (cashBalance * (pct / 100)) / 1.0015;
      if (inputMode === 'usd') {
        setAmountStr(budget.toFixed(2));
      } else {
        setAmountStr((budget / activePrice).toFixed(4));
      }
    } else {
      const cryptoUnits = availableCrypto * (pct / 100);
      if (inputMode === 'crypto') {
        setAmountStr(cryptoUnits.toFixed(4));
      } else {
        setAmountStr((cryptoUnits * activePrice).toFixed(2));
      }
    }
  };

  const validateAndPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (amountCrypto <= 0) {
      setErrorMessage('Please specify an amount greater than 0.');
      return;
    }

    if (side === 'buy' && netTotalUSD > cashBalance) {
      setErrorMessage(
        `Insufficient practice balance. Required: ${formatCurrency(netTotalUSD)}, available: ${formatCurrency(cashBalance)}`
      );
      return;
    }

    if (side === 'sell' && amountCrypto > availableCrypto) {
      setErrorMessage(
        `Insufficient ${currentAsset.symbol}. You have ${availableCrypto} ${currentAsset.symbol}`
      );
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmOrder = () => {
    setShowConfirmModal(false);
    const result = executeTrade({
      type: side,
      assetId: currentAsset.id,
      amountCrypto: +amountCrypto.toFixed(currentAsset.price > 10 ? 4 : 6),
      pricePerUnit: activePrice,
      feeUSD
    });

    if (result.success) {
      setAmountStr('');
    } else {
      setErrorMessage(result.message);
    }
  };

  // Generate simulated Order Book bids and asks depth
  const orderBook = useMemo(() => {
    const base = currentAsset.price;
    const asks: Array<{ price: number; amount: number; total: number }> = [];
    const bids: Array<{ price: number; amount: number; total: number }> = [];

    let askTotal = 0;
    for (let i = 5; i >= 1; i--) {
      const price = +(base * (1 + i * 0.0018)).toFixed(base > 10 ? 2 : 4);
      const amount = +(Math.random() * (base > 1000 ? 1.5 : 120) + 0.2).toFixed(3);
      askTotal += amount;
      asks.push({ price, amount, total: askTotal });
    }

    let bidTotal = 0;
    for (let i = 1; i <= 5; i++) {
      const price = +(base * (1 - i * 0.0018)).toFixed(base > 10 ? 2 : 4);
      const amount = +(Math.random() * (base > 1000 ? 1.5 : 120) + 0.2).toFixed(3);
      bidTotal += amount;
      bids.push({ price, amount, total: bidTotal });
    }

    return { asks, bids };
  }, [currentAsset.price]);

  return (
    <div className="space-y-6">
      {/* Trading Pair Ticker Header */}
      <div className="p-4 rounded-2xl bg-[#0f1523] border border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Pair Selector */}
          <div className="relative">
            <select
              value={selectedAssetId}
              onChange={(e) => {
                setSelectedAssetId(e.target.value);
                setLimitPriceStr('');
                setAmountStr('');
              }}
              className="bg-[#090d16] border border-white/10 rounded-xl pl-3 pr-8 py-2 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer appearance-none"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.symbol}/USD — {a.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          <div className="h-8 w-px bg-white/10 hidden sm:block" />

          {/* Current Price */}
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              ${currentAsset.price.toLocaleString(undefined, { maximumFractionDigits: currentAsset.price > 10 ? 2 : 4 })}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Modeled Market Index</div>
          </div>

          {/* 24h Change */}
          <div className="hidden sm:block">
            <div
              className={`text-sm font-bold font-mono ${
                currentAsset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {currentAsset.change24h >= 0 ? '+' : ''}{currentAsset.change24h.toFixed(2)}%
            </div>
            <div className="text-[10px] text-slate-400">24h Change</div>
          </div>

          {/* 24h High */}
          <div className="hidden md:block">
            <div className="text-xs font-semibold font-mono text-white">
              ${currentAsset.high24h.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">24h High</div>
          </div>

          {/* 24h Low */}
          <div className="hidden md:block">
            <div className="text-xs font-semibold font-mono text-white">
              ${currentAsset.low24h.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">24h Low</div>
          </div>

          {/* 24h Volume */}
          <div className="hidden lg:block">
            <div className="text-xs font-semibold font-mono text-white">
              ${(currentAsset.volume24h / 1e6).toFixed(1)}M
            </div>
            <div className="text-[10px] text-slate-400">24h Volume</div>
          </div>
        </div>

        {/* Practice activity disclosure */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Practice Trading · No live orders</span>
        </div>
      </div>

      {/* Main Terminal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Interactive Chart + Order Book */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Terminal Chart */}
          <div className="p-6 rounded-2xl bg-[#0f1523] border border-white/5 shadow-xl">
            <InteractiveChart
              baseValue={currentAsset.price}
              timeRange={chartTimeframe}
              onTimeRangeChange={setChartTimeframe}
              title={`${currentAsset.symbol} / USD modeled price feed`}
            />
          </div>

          {/* Simulated Order Book & Recent Trades */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Order Book */}
            <div className="p-4 rounded-2xl bg-[#0f1523] border border-white/5 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/5 font-sans">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Modeled Order Book
                </span>
                <span className="text-[10px] text-slate-400">Depth (5x5)</span>
              </div>

              {/* Asks (Sell Orders - Red) */}
              <div className="mt-2 space-y-1">
                {orderBook.asks.map((ask, idx) => (
                  <div key={idx} className="flex justify-between text-rose-400 text-[11px] py-0.5 px-1 rounded hover:bg-white/5">
                    <span>${ask.price.toLocaleString()}</span>
                    <span className="text-slate-300">{ask.amount}</span>
                    <span className="text-slate-400">{ask.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Spread Indicator */}
              <div className="my-2 py-1 px-2 rounded-lg bg-[#0a0e17] flex items-center justify-between text-[11px] font-bold">
                <span className="text-white">${currentAsset.price.toLocaleString()}</span>
                <span className="text-cyan-400 text-[10px]">SPREAD: $0.15 (0.01%)</span>
              </div>

              {/* Bids (Buy Orders - Green) */}
              <div className="space-y-1">
                {orderBook.bids.map((bid, idx) => (
                  <div key={idx} className="flex justify-between text-emerald-400 text-[11px] py-0.5 px-1 rounded hover:bg-white/5">
                    <span>${bid.price.toLocaleString()}</span>
                    <span className="text-slate-300">{bid.amount}</span>
                    <span className="text-slate-400">{bid.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Position Summary for current asset */}
            <div className="p-4 rounded-2xl bg-[#0f1523] border border-white/5 flex flex-col justify-between text-xs">
              <div>
                <div className="font-bold text-xs uppercase tracking-wider text-slate-300 pb-2 border-b border-white/5">
                  Your Practice Position in {currentAsset.symbol}
                </div>

                <div className="mt-3 space-y-2.5 font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Quantity Held:</span>
                    <span className="text-white font-bold">{availableCrypto} {currentAsset.symbol}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Current Valuation:</span>
                    <span className="text-cyan-400 font-bold">{formatCurrency(availableCrypto * currentAsset.price)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Average Buy Basis:</span>
                    <span className="text-white">
                      ${holding ? holding.averageBuyPrice.toLocaleString() : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Unrealized Gain/Loss:</span>
                    <span
                      className={`font-bold ${
                        holding && currentAsset.price >= holding.averageBuyPrice
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {holding
                        ? formatCurrency((currentAsset.price - holding.averageBuyPrice) * availableCrypto)
                        : '$0.00'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Zero real financial liability. Practice sizing, stop limits, and scaling positions.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Interactive Order Form */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-2xl bg-[#0f1523] border border-white/5 shadow-xl space-y-4">
            {/* Buy / Sell Selector */}
            <div className="grid grid-cols-2 p-1 bg-[#0a0e17] rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setSide('buy');
                  setErrorMessage('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  side === 'buy'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
                BUY
              </button>
              <button
                type="button"
                onClick={() => {
                  setSide('sell');
                  setErrorMessage('');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  side === 'sell'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-950/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
                SELL
              </button>
            </div>

            {/* Order Type: Market / Limit */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOrderType('market')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  orderType === 'market'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Market Order
              </button>
              <button
                type="button"
                onClick={() => setOrderType('limit')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  orderType === 'limit'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Limit Order
              </button>
            </div>

            {/* Limit Price Input if limit order */}
            {orderType === 'limit' && (
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Limit Execution Price (USD)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder={currentAsset.price.toString()}
                  value={limitPriceStr}
                  onChange={(e) => setLimitPriceStr(e.target.value)}
                  className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            )}

            {/* Balances Availability */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{side === 'buy' ? 'Available Cash:' : `Available ${currentAsset.symbol}:`}</span>
              <span className="text-white font-semibold">
                {side === 'buy' ? formatCurrency(cashBalance) : `${availableCrypto} ${currentAsset.symbol}`}
              </span>
            </div>

            {/* Order Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Amount
                </label>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setInputMode('usd')}
                    className={`px-2 py-0.5 rounded ${inputMode === 'usd' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('crypto')}
                    className={`px-2 py-0.5 rounded ${inputMode === 'crypto' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'}`}
                  >
                    {currentAsset.symbol}
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => {
                    setAmountStr(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3.5 py-3 text-base font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
                />
                <span className="absolute right-3 top-3.5 text-xs font-mono text-slate-400">
                  {inputMode === 'usd' ? 'USD' : currentAsset.symbol}
                </span>
              </div>

              {/* Percentage Presets */}
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercent(pct)}
                    className="py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-300 transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Order Cost Breakdown */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Practice Units:</span>
                <span className="text-white font-semibold">
                  {amountCrypto.toFixed(amountCrypto < 1 ? 4 : 2)} {currentAsset.symbol}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Est. Rate:</span>
                <span className="text-white">${activePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Trading Fee (0.15%):</span>
                <span className="text-slate-300">${feeUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-white/5 font-semibold">
                <span className="text-slate-200">
                  Total {side === 'buy' ? 'Cost' : 'Proceeds'}:
                </span>
                <span className="text-cyan-400">{formatCurrency(netTotalUSD)}</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={validateAndPrompt}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                side === 'buy'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40'
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-950/40'
              }`}
            >
              Preview Practice {side.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#111726] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  side === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {side === 'buy' ? <ArrowDown className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  Confirm Practice {side.toUpperCase()}
                </h3>
                <p className="text-xs text-slate-400">Review the local practice order</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Asset:</span>
                <span className="text-white font-bold">{currentAsset.name} ({currentAsset.symbol})</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Order Type:</span>
                <span className="text-white uppercase">{orderType}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Quantity:</span>
                <span className="text-white font-bold">{amountCrypto.toFixed(4)} {currentAsset.symbol}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Execution Price:</span>
                <span className="text-white">${activePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Fee (0.15%):</span>
                <span className="text-slate-400">${feeUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 font-bold text-sm">
                <span className="text-slate-200">Total Net:</span>
                <span className="text-cyan-400">{formatCurrency(netTotalUSD)}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              This records a practice order in your local portfolio history. No live order is submitted and no real assets are traded.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                  side === 'buy'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-950/40'
                }`}
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
