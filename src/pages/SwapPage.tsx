import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  ArrowDownUp,
  Settings2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Zap,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export const SwapPage: React.FC = () => {
  const { assets, holdings, executeSwap, formatCurrency } = useCrypto();

  const [fromAssetId, setFromAssetId] = useState('ethereum');
  const [toAssetId, setToAssetId] = useState('solana');
  const [fromAmountStr, setFromAmountStr] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fromAsset = assets.find((a) => a.id === fromAssetId) || assets[0];
  const toAsset = assets.find((a) => a.id === toAssetId) || assets[1];

  const fromHolding = holdings.find((h) => h.assetId === fromAssetId);
  const availableFrom = fromHolding ? fromHolding.amount : 0;

  const toHolding = holdings.find((h) => h.assetId === toAssetId);
  const availableTo = toHolding ? toHolding.amount : 0;

  // Calculation
  const fromAmount = parseFloat(fromAmountStr) || 0;
  const exchangeRate = toAsset.price > 0 ? fromAsset.price / toAsset.price : 1;
  const rawToAmount = fromAmount * exchangeRate;
  const feeUSD = +(fromAmount * fromAsset.price * 0.002).toFixed(2); // 0.2% DEX liquidity fee
  const feeInToAsset = toAsset.price > 0 ? feeUSD / toAsset.price : 0;
  const finalToAmount = Math.max(0, rawToAmount - feeInToAsset);

  // Invert tokens
  const handleFlip = () => {
    setFromAssetId(toAssetId);
    setToAssetId(fromAssetId);
    setFromAmountStr('');
    setErrorMessage('');
  };

  const handleMax = () => {
    setFromAmountStr(availableFrom.toString());
    setErrorMessage('');
  };

  const validateAndOpenModal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (fromAmount <= 0) {
      setErrorMessage('Please enter an amount to swap.');
      return;
    }

    if (fromAmount > availableFrom) {
      setErrorMessage(`Insufficient ${fromAsset.symbol}. Available: ${availableFrom} ${fromAsset.symbol}`);
      return;
    }

    if (fromAssetId === toAssetId) {
      setErrorMessage('Cannot swap a token for itself. Please select different assets.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSwap = () => {
    setShowConfirmModal(false);
    const result = executeSwap({
      fromAssetId,
      toAssetId,
      fromAmount,
      toAmount: +finalToAmount.toFixed(4),
      feeUSD
    });

    if (result.success) {
      setFromAmountStr('');
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header Info Banner */}
      <div className="p-4 rounded-2xl bg-[#0f1523] border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">NEXORA Token Swap</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review a modeled exchange rate and fee estimate
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Swap Slippage Settings"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {/* Slippage Settings Drawer */}
      {showSettings && (
        <div className="p-4 rounded-2xl bg-[#0e1422] border border-cyan-500/20 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Slippage Tolerance</span>
            <span className="text-cyan-400 font-mono">{slippage}%</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['0.1', '0.5', '1.0', '2.0'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setSlippage(val)}
                className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  slippage === val
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Swap Box Container */}
      <form onSubmit={validateAndOpenModal} className="p-6 rounded-2xl bg-[#0f1523] border border-white/5 shadow-2xl space-y-4">
        {/* FROM Token Card */}
        <div className="p-4 rounded-xl bg-[#0a0e17] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>You Pay (Practice)</span>
            <div className="flex items-center gap-1.5">
              <span>Balance: {availableFrom} {fromAsset.symbol}</span>
              <button
                type="button"
                onClick={handleMax}
                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 px-1 py-0.2 rounded bg-cyan-500/10"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              type="number"
              step="any"
              placeholder="0.0"
              value={fromAmountStr}
              onChange={(e) => {
                setFromAmountStr(e.target.value);
                setErrorMessage('');
              }}
              className="w-full bg-transparent text-2xl font-mono font-bold text-white placeholder-slate-400 focus:outline-none"
            />

            {/* From Token Select */}
            <div className="relative shrink-0">
              <select
                value={fromAssetId}
                onChange={(e) => {
                  setFromAssetId(e.target.value);
                  setErrorMessage('');
                }}
                className="bg-[#141b2c] border border-white/10 rounded-xl pl-3 pr-7 py-2 text-xs font-bold text-white focus:outline-none appearance-none cursor-pointer"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.symbol}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            ~{formatCurrency(fromAmount * fromAsset.price)}
          </div>
        </div>

        {/* Swap Direction Flip Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            type="button"
            onClick={handleFlip}
            className="p-2.5 rounded-full bg-[#162035] border border-cyan-500/30 text-cyan-400 hover:text-white hover:bg-cyan-500/20 shadow-lg shadow-cyan-950/40 transition-all"
            title="Invert swap pair"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>

        {/* TO Token Card */}
        <div className="p-4 rounded-xl bg-[#0a0e17] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>You Receive (Estimated)</span>
            <span>Balance: {availableTo} {toAsset.symbol}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="w-full text-2xl font-mono font-bold text-emerald-400 truncate">
              {finalToAmount > 0 ? finalToAmount.toFixed(4) : '0.00'}
            </div>

            {/* To Token Select */}
            <div className="relative shrink-0">
              <select
                value={toAssetId}
                onChange={(e) => {
                  setToAssetId(e.target.value);
                  setErrorMessage('');
                }}
                className="bg-[#141b2c] border border-white/10 rounded-xl pl-3 pr-7 py-2 text-xs font-bold text-white focus:outline-none appearance-none cursor-pointer"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.symbol}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            ~{formatCurrency(finalToAmount * toAsset.price)}
          </div>
        </div>

        {/* Swap Rates Breakdown */}
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Exchange Rate:</span>
            <span className="text-white">
              1 {fromAsset.symbol} = {exchangeRate.toFixed(4)} {toAsset.symbol}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Routing Protocol:</span>
            <span className="text-cyan-400">NEXORA modeled route</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Estimated practice fee (0.2%):</span>
            <span className="text-slate-300">${feeUSD.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Slippage Limit:</span>
            <span className="text-emerald-400">Max {slippage}%</span>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Execute Button */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/40"
        >
          Review Practice Swap
        </button>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#111726] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <ArrowDownUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Confirm Practice Swap</h3>
                <p className="text-xs text-slate-400">Review the changes to your practice balances</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>You Swap:</span>
                <span className="text-rose-400 font-bold">
                  -{fromAmount} {fromAsset.symbol}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>You Receive:</span>
                <span className="text-emerald-400 font-bold">
                  +{finalToAmount.toFixed(4)} {toAsset.symbol}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Rate:</span>
                <span className="text-white">1 {fromAsset.symbol} = {exchangeRate.toFixed(4)} {toAsset.symbol}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Modeled Network Fee:</span>
                <span className="text-slate-400">${feeUSD.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              Only your locally stored practice balances will change. No assets are sent or received and no network transaction is submitted.
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
                onClick={handleConfirmSwap}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-950/40"
              >
                Confirm Swap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
