import React, { useState, useEffect } from 'react';
import { useCrypto } from '../../context/CryptoContext';
import { X, Trash2, Plus, Check } from 'lucide-react';

interface HoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAssetId?: string;
}

export const HoldingModal: React.FC<HoldingModalProps> = ({
  isOpen,
  onClose,
  defaultAssetId = 'bitcoin'
}) => {
  const { assets, holdings, addOrUpdateHolding, removeHolding, formatCurrency } = useCrypto();

  const [selectedAssetId, setSelectedAssetId] = useState(defaultAssetId);
  const [amountStr, setAmountStr] = useState('');
  const [avgPriceStr, setAvgPriceStr] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];
  const existingHolding = holdings.find((h) => h.assetId === selectedAssetId);

  useEffect(() => {
    if (defaultAssetId) setSelectedAssetId(defaultAssetId);
  }, [defaultAssetId, isOpen]);

  useEffect(() => {
    if (existingHolding) {
      setAmountStr(existingHolding.amount.toString());
      setAvgPriceStr(existingHolding.averageBuyPrice.toString());
    } else if (currentAsset) {
      setAmountStr('1');
      setAvgPriceStr(currentAsset.price.toString());
    }
    setErrorMsg('');
  }, [selectedAssetId, existingHolding, currentAsset]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const amount = parseFloat(amountStr);
    const avgPrice = parseFloat(avgPriceStr);

    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Please enter a valid quantity greater than zero.');
      return;
    }

    if (isNaN(avgPrice) || avgPrice < 0) {
      setErrorMsg('Please enter a valid average cost basis.');
      return;
    }

    addOrUpdateHolding({
      assetId: selectedAssetId,
      amount,
      averageBuyPrice: avgPrice
    });

    onClose();
  };

  const handleDelete = () => {
    if (existingHolding) {
      removeHolding(selectedAssetId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111726] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-white">
              {existingHolding ? 'Edit Simulated Position' : 'Add Simulated Holding'}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Asset Picker */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Select Cryptocurrency
            </label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full bg-[#0e1422] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.symbol}) — Market: ${a.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Amount input */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Simulated Quantity ({currentAsset.symbol})
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 2.5"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full bg-[#0e1422] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Average Cost Basis input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Average Buy Price (USD)
              </label>
              <button
                type="button"
                onClick={() => setAvgPriceStr(currentAsset.price.toString())}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Use current (${currentAsset.price.toLocaleString()})
              </button>
            </div>
            <input
              type="number"
              step="any"
              placeholder="e.g. 62000"
              value={avgPriceStr}
              onChange={(e) => setAvgPriceStr(e.target.value)}
              className="w-full bg-[#0e1422] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Summary Preview */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Simulated Valuation:</span>
              <span className="text-white font-semibold">
                {formatCurrency((parseFloat(amountStr) || 0) * currentAsset.price)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Simulated Total Cost:</span>
              <span className="text-slate-300">
                {formatCurrency((parseFloat(amountStr) || 0) * (parseFloat(avgPriceStr) || 0))}
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {existingHolding && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Simulated Position
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
