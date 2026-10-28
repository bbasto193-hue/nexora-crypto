import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  Send,
  QrCode,
  Copy,
  Check,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const TransferPage: React.FC = () => {
  const {
    assets,
    holdings,
    executeSend,
    executeSimulateDeposit,
    addToast,
    formatCurrency
  } = useCrypto();

  const [activeTab, setActiveTab] = useState<'send' | 'receive'>('send');

  // SEND State
  const [sendAssetId, setSendAssetId] = useState('bitcoin');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmountStr, setSendAmountStr] = useState('');
  const [networkSpeed, setNetworkSpeed] = useState<'standard' | 'fast' | 'instant'>('fast');
  const [sendError, setSendError] = useState('');
  const [showSendReview, setShowSendReview] = useState(false);

  // RECEIVE State
  const [receiveAssetId, setReceiveAssetId] = useState('bitcoin');
  const [copied, setCopied] = useState(false);
  const [simulateDepositAmount, setSimulateDepositAmount] = useState('0.1');

  const selectedSendAsset = assets.find((a) => a.id === sendAssetId) || assets[0];
  const sendHolding = holdings.find((h) => h.assetId === sendAssetId);
  const availableToSend = sendHolding ? sendHolding.amount : 0;

  const selectedReceiveAsset = assets.find((a) => a.id === receiveAssetId) || assets[0];
  const receiveHolding = holdings.find((h) => h.assetId === receiveAssetId);

  const numericSendAmount = parseFloat(sendAmountStr) || 0;
  const sendValueUSD = numericSendAmount * selectedSendAsset.price;

  // Network fee based on speed
  const networkFees = {
    standard: { feeUSD: 1.5, time: '~10 mins' },
    fast: { feeUSD: 3.5, time: '~2 mins' },
    instant: { feeUSD: 6.0, time: '< 30 secs' }
  };
  const activeFee = networkFees[networkSpeed];

  // Preset institutional addresses for convenience
  const demoRecipients = [
    { label: 'Primary Institutional Vault', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    { label: 'Custody Cold Storage', address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq' },
    { label: 'Escrow Settlement Wallet', address: 'NX-ESCROW-8921-9982-4100' }
  ];

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('success', 'Copied', 'Address copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleMaxSend = () => {
    setSendAmountStr(availableToSend.toString());
    setSendError('');
  };

  const handleValidateSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSendError('');

    if (numericSendAmount <= 0) {
      setSendError('Please enter an amount greater than zero.');
      return;
    }

    if (numericSendAmount > availableToSend) {
      setSendError(`Insufficient ${selectedSendAsset.symbol}. Available: ${availableToSend} ${selectedSendAsset.symbol}`);
      return;
    }

    if (!recipientAddress.trim()) {
      setSendError('Please enter or select a recipient simulated identifier.');
      return;
    }

    setShowSendReview(true);
  };

  const handleConfirmSend = () => {
    setShowSendReview(false);
    const result = executeSend({
      assetId: selectedSendAsset.id,
      amount: numericSendAmount,
      recipientAddress,
      feeUSD: activeFee.feeUSD,
      network: `${selectedSendAsset.name} Network (Simulated)`
    });

    if (result.success) {
      setSendAmountStr('');
      setRecipientAddress('');
    } else {
      setSendError(result.message);
    }
  };

  const handleTriggerDemoDeposit = () => {
    const depositAmt = parseFloat(simulateDepositAmount) || 0.1;
    executeSimulateDeposit({
      assetId: selectedReceiveAsset.id,
      amount: depositAmt,
      senderAddress: 'simulated-liquidity-partner.eth'
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Tab Switcher: Send vs Receive */}
      <div className="grid grid-cols-2 p-1.5 bg-[#0f1523] border border-white/5 rounded-2xl">
        <button
          onClick={() => setActiveTab('send')}
          className={`py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'send'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-950/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Send</span>
        </button>

        <button
          onClick={() => setActiveTab('receive')}
          className={`py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'receive'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-950/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Receive</span>
        </button>
      </div>

      {activeTab === 'send' ? (
        /* ------------------ SEND INTERFACE ------------------ */
        <div className="p-6 rounded-2xl bg-[#0f1523] border border-white/5 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h2 className="font-bold text-base text-white">Send Cryptocurrency</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Transfer digital assets to an external wallet or institutional address
              </p>
            </div>
          </div>

          <form onSubmit={handleValidateSend} className="space-y-4">
            {/* Asset Picker */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Asset to Send
              </label>
              <select
                value={sendAssetId}
                onChange={(e) => {
                  setSendAssetId(e.target.value);
                  setSendError('');
                }}
                className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.symbol}) — Market: ${a.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Address Input */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Recipient Address
              </label>
              <input
                type="text"
                placeholder="e.g. 0x71C... or bc1q..."
                value={recipientAddress}
                onChange={(e) => {
                  setRecipientAddress(e.target.value);
                  setSendError('');
                }}
                className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
              />

              {/* Preset address chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400">Presets:</span>
                {demoRecipients.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRecipientAddress(preset.address)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Transfer Amount
                </label>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span>Available: {availableToSend} {selectedSendAsset.symbol}</span>
                  <button
                    type="button"
                    onClick={handleMaxSend}
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 px-1.5 py-0.2 rounded bg-cyan-500/10"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={sendAmountStr}
                  onChange={(e) => {
                    setSendAmountStr(e.target.value);
                    setSendError('');
                  }}
                  className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3.5 py-3 text-base font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
                />
                <span className="absolute right-3.5 top-3.5 text-xs font-mono text-slate-400">
                  {selectedSendAsset.symbol}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                Estimated Value: {formatCurrency(sendValueUSD)}
              </div>
            </div>

            {/* Network Priority */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Priority & Network Speed
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['standard', 'fast', 'instant'] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setNetworkSpeed(spd)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      networkSpeed === spd
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold capitalize">{spd}</div>
                    <div className="text-[10px] font-mono mt-0.5">${networkFees[spd].feeUSD} fee</div>
                    <div className="text-[9px] text-slate-400">{networkFees[spd].time}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {sendError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{sendError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/40 cursor-pointer"
            >
              Review Transfer
            </button>
          </form>

          {/* Send Review Modal */}
          {showSendReview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="bg-[#111726] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Confirm Transfer</h3>
                    <p className="text-xs text-slate-400">Review transfer parameters before dispatch</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Sending:</span>
                    <span className="text-white font-bold">
                      {numericSendAmount} {selectedSendAsset.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Recipient:</span>
                    <span className="text-cyan-400 truncate max-w-[200px]">{recipientAddress}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Network:</span>
                    <span className="text-white">{selectedSendAsset.name} Network</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Network Fee:</span>
                    <span className="text-slate-400">${activeFee.feeUSD.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10 font-bold">
                    <span>Total Valuation:</span>
                    <span className="text-white">{formatCurrency(sendValueUSD + activeFee.feeUSD)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    Notice: Transactions are processed within the NOVEXA institutional ledger environment.
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSendReview(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSend}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/40 cursor-pointer"
                  >
                    Confirm & Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ------------------ RECEIVE INTERFACE ------------------ */
        <div className="p-6 rounded-2xl bg-[#0f1523] border border-white/5 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h2 className="font-bold text-base text-white">Receive Cryptocurrency</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Deposit address and QR code for receiving assets
              </p>
            </div>
          </div>

          {/* Select Coin to Receive */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Select Deposit Asset
            </label>
            <select
              value={receiveAssetId}
              onChange={(e) => setReceiveAssetId(e.target.value)}
              className="w-full bg-[#0a0e17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Generated Realistic QR Code (Clean High-Contrast SVG) */}
          <div className="p-6 rounded-2xl bg-white flex flex-col items-center justify-center max-w-xs mx-auto shadow-2xl">
            <svg viewBox="0 0 160 160" className="w-44 h-44">
              {/* Distinctive stylized QR matrix */}
              <rect width="160" height="160" fill="#ffffff" />
              {/* Corner Position Marks */}
              {/* Top-Left */}
              <rect x="12" y="12" width="40" height="40" fill="#0b0e14" rx="6" />
              <rect x="18" y="18" width="28" height="28" fill="#ffffff" rx="3" />
              <rect x="24" y="24" width="16" height="16" fill="#0b0e14" rx="2" />
              {/* Top-Right */}
              <rect x="108" y="12" width="40" height="40" fill="#0b0e14" rx="6" />
              <rect x="114" y="18" width="28" height="28" fill="#ffffff" rx="3" />
              <rect x="120" y="24" width="16" height="16" fill="#0b0e14" rx="2" />
              {/* Bottom-Left */}
              <rect x="12" y="108" width="40" height="40" fill="#0b0e14" rx="6" />
              <rect x="18" y="114" width="28" height="28" fill="#ffffff" rx="3" />
              <rect x="24" y="120" width="16" height="16" fill="#0b0e14" rx="2" />

              {/* Data matrix dots */}
              <g fill="#0b0e14">
                <rect x="60" y="16" width="8" height="8" />
                <rect x="76" y="16" width="8" height="8" />
                <rect x="88" y="16" width="8" height="8" />
                <rect x="68" y="28" width="8" height="8" />
                <rect x="84" y="28" width="8" height="8" />
                <rect x="60" y="44" width="8" height="8" />
                <rect x="72" y="44" width="8" height="8" />
                <rect x="88" y="44" width="8" height="8" />

                {/* Center logo emblem */}
                <rect x="64" y="64" width="32" height="32" rx="6" fill="#0284c7" />
                <circle cx="80" cy="80" r="8" fill="#ffffff" />

                {/* Bottom section */}
                <rect x="60" y="108" width="8" height="8" />
                <rect x="76" y="108" width="8" height="8" />
                <rect x="108" y="60" width="8" height="8" />
                <rect x="124" y="60" width="8" height="8" />
                <rect x="140" y="60" width="8" height="8" />
                <rect x="108" y="76" width="8" height="8" />
                <rect x="132" y="76" width="8" height="8" />
                <rect x="116" y="92" width="8" height="8" />
                <rect x="132" y="92" width="8" height="8" />
                <rect x="68" y="124" width="8" height="8" />
                <rect x="84" y="124" width="8" height="8" />
                <rect x="108" y="124" width="8" height="8" />
                <rect x="124" y="124" width="8" height="8" />
                <rect x="140" y="124" width="8" height="8" />
                <rect x="60" y="140" width="8" height="8" />
                <rect x="76" y="140" width="8" height="8" />
                <rect x="116" y="140" width="8" height="8" />
                <rect x="132" y="140" width="8" height="8" />
              </g>
            </svg>
          </div>

          {/* Deposit Address Card */}
          <div className="p-3.5 rounded-xl bg-[#0a0e17] border border-white/5 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Deposit Address
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-white break-all select-all">
                {selectedReceiveAsset.demoDepositAddress}
              </span>
              <button
                type="button"
                onClick={() => handleCopyAddress(selectedReceiveAsset.demoDepositAddress)}
                className="shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                title="Copy deposit address"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Notice Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              Notice: For portfolio simulation and modeling only. Do not send live mainnet cryptocurrency to this address.
            </p>
          </div>

          {/* Inbound Deposit Simulator */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-xs text-white">Simulate Deposit</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Credit incoming assets to portfolio</span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                step="any"
                value={simulateDepositAmount}
                onChange={(e) => setSimulateDepositAmount(e.target.value)}
                placeholder="0.1"
                className="w-32 bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
              <span className="text-xs font-mono text-slate-300">{selectedReceiveAsset.symbol}</span>

              <button
                type="button"
                onClick={handleTriggerDemoDeposit}
                className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-lg shadow-purple-950/40 cursor-pointer"
              >
                Deposit +{simulateDepositAmount} {selectedReceiveAsset.symbol}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
