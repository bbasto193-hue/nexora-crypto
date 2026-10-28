import React, { useState, useEffect } from 'react';
import { useCrypto } from '../../context/CryptoContext';
import { X, ArrowDown, ArrowUp, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAssetId?: string;
  defaultType?: 'buy' | 'sell';
}

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  defaultAssetId = 'bitcoin',
  defaultType = 'buy'
}) => {
  const { assets, holdings, cashBalance, executeTrade, formatCurrency } = useCrypto();

  const [type, setType] = useState<'buy' | 'sell'>(defaultType);
  const [selectedAssetId, setSelectedAssetId] = useState(defaultAssetId);
  const [amountStr, setAmountStr] = useState('');
  const [inputMode, setInputMode] = useState<'crypto' | 'usd'>('usd');
  const [errorMsg, setErrorMsg] = useState('');
  const [successReceipt, setSuccessReceipt] = useState<{
    amount: number;
    symbol: string;
    totalUSD: number;
    price: number;
  } | null>(null);

  useEffect(() => {
    if (defaultAssetId) setSelectedAssetId(defaultAssetId);
    if (defaultType) setType(defaultType);
    setAmountStr('');
    setErrorMsg('');
    setSuccessReceipt(null);
  }, [defaultAssetId, defaultType, isOpen]);

  if (!isOpen) return null;

  const currentAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];
  const holding = holdings.find((h) => h.assetId === selectedAssetId);
  const availableCrypto = holding ? holding.amount : 0;

  const numericInput = parseFloat(amountStr) || 0;
  const amountCrypto = inputMode === 'crypto' ? numericInput : numericInput / (currentAsset?.price || 1);
  const totalValueUSD = amountCrypto * (currentAsset?.price || 0);
  const feeUSD = +(totalValueUSD * 0.0015).toFixed(2); // 0.15% simulated broker fee
  const netTotalUSD = type === 'buy' ? totalValueUSD + feeUSD : totalValueUSD - feeUSD;

  // Percentage quick buttons (25%, 50%, 75%, 100%)
  const handleQuickPercent = (pct: number) => {
    setErrorMsg('');
    if (type === 'buy') {
      const budget = (cashBalance * (pct / 100)) / 1.0015;
      if (inputMode === 'usd') {
        setAmountStr(budget.toFixed(2));
      } else {
        const cryptoUnits = budget / currentAsset.price;
        setAmountStr(cryptoUnits.toFixed(cryptoUnits < 1 ? 4 : 2));
      }
    } else {
      const cryptoUnits = availableCrypto * (pct / 100);
      if (inputMode === 'crypto') {
        setAmountStr(cryptoUnits.toFixed(cryptoUnits < 1 ? 4 : 2));
      } else {
        setAmountStr((cryptoUnits * currentAsset.price).toFixed(2));
      }
    }
  };

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (amountCrypto <= 0) {
      setErrorMsg('Please enter a valid amount greater than zero.');
      return;
    }

    if (type === 'buy' && netTotalUSD > cashBalance) {
      setErrorMsg(`Insufficient simulated cash. You need ${formatCurrency(netTotalUSD)}, available: ${formatCurrency(cashBalance)}`);
      return;
    }

    if (type === 'sell' && amountCrypto > availableCrypto) {
      setErrorMsg(`Insufficient ${currentAsset.symbol} balance. You hold ${availableCrypto} ${currentAsset.symbol}`);
      return;
    }

    const result = executeTrade({
      type,
      assetId: currentAsset.id,
      amountCrypto: +amountCrypto.toFixed(currentAsset.price > 10 ? 4 : 6),
      pricePerUnit: currentAsset.price,
      feeUSD
    });

    if (result.success) {
      setSuccessReceipt({
        amount: +amountCrypto.toFixed(4),
        symbol: currentAsset.symbol,
        totalUSD: netTotalUSD,
        price: currentAsset.price
      });
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111726] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-white">Simulated Trade Order</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              SANDBOX
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successReceipt ? (
          /* Success Receipt Card */
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/10">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Simulated Order Settled!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your paper trading order has been filled and recorded to your simulated ledger.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Action:</span>
                <span className={type === 'buy' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {type.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Asset:</span>
                <span className="text-white font-bold">{successReceipt.symbol}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Quantity:</span>
                <span className="text-white">{successReceipt.amount} {successReceipt.symbol}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Execution Price:</span>
                <span className="text-white">${successReceipt.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-2 border-t border-white/10">
                <span>Total Value:</span>
                <span className="text-cyan-400 font-bold">{formatCurrency(successReceipt.totalUSD)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setSuccessReceipt(null);
                  setAmountStr('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 transition-colors"
              >
                Place Another Trade
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-cyan-950/40 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Trade Form */
          <form onSubmit={handleExecute} className="p-5 space-y-4">
            {/* Buy / Sell Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#0a0e17] rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setType('buy')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  type === 'buy'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
                BUY {currentAsset?.symbol}
              </button>
              <button
                type="button"
                onClick={() => setType('sell')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  type === 'sell'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-950/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
                SELL {currentAsset?.symbol}
              </button>
            </div>

            {/* Asset Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Select Asset
              </label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full bg-[#0e1422] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.symbol}) — ${a.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Available Balance Helper */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span>
                {type === 'buy' ? 'Available Cash:' : `Available ${currentAsset.symbol}:`}
              </span>
              <span className="text-white font-semibold">
                {type === 'buy'
                  ? formatCurrency(cashBalance)
                  : `${availableCrypto} ${currentAsset.symbol}`}
              </span>
            </div>

            {/* Amount Input with Currency / Crypto toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Order Amount
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
                    setErrorMsg('');
                  }}
                  className="w-full bg-[#0e1422] border border-white/10 rounded-xl px-3.5 py-3 text-base font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
                />
                <span className="absolute right-3 top-3.5 text-xs font-mono text-slate-400">
                  {inputMode === 'usd' ? 'USD' : currentAsset.symbol}
                </span>
              </div>

              {/* Quick % buttons */}
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleQuickPercent(pct)}
                    className="py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-300 transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Order Breakdown */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Simulated Market Price:</span>
                <span className="text-white">${currentAsset.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Est. Crypto Units:</span>
                <span className="text-white">{amountCrypto.toFixed(amountCrypto < 1 ? 4 : 2)} {currentAsset.symbol}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Simulated Fee (0.15%):</span>
                <span className="text-slate-300">${feeUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-white/5 font-semibold">
                <span className="text-slate-200">Total {type === 'buy' ? 'Payable' : 'Proceeds'}:</span>
                <span className="text-cyan-400">{formatCurrency(netTotalUSD)}</span>
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                type === 'buy'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40'
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-950/40'
              }`}
            >
              Simulate {type.toUpperCase()} Order
            </button>

            <div className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
              <ShieldAlert className="w-3 h-3 text-cyan-400" />
              <span>Simulated trade execution. No real capital or blockchain involved.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
