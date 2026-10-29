import React, { useState, useMemo } from 'react';
import { useCrypto } from '../context/CryptoContext';
import {
  History,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { Transaction, TransactionType } from '../types/crypto';
import { formatTransactionNote, formatTransactionStatus } from '../utils/transactionPresentation';

export const HistoryPage: React.FC = () => {
  const { transactions, formatCurrency, exportPortfolioCSV, addToast } = useCrypto();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const itemsPerPage = 8;

  // Filtered transactions
  const filteredTx = useMemo(() => {
    return transactions.filter((tx) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        tx.assetSymbol.toLowerCase().includes(q) ||
        tx.hash.toLowerCase().includes(q) ||
        (tx.counterAssetSymbol && tx.counterAssetSymbol.toLowerCase().includes(q)) ||
        (tx.recipientAddress && tx.recipientAddress.toLowerCase().includes(q)) ||
        (tx.note && tx.note.toLowerCase().includes(q));

      const matchesType = selectedType === 'all' || tx.type === selectedType;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'completed' && tx.status.includes('Completed')) ||
        (selectedStatus === 'pending' && tx.status.includes('Pending'));

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transactions, searchQuery, selectedType, selectedStatus]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredTx.length / itemsPerPage) || 1;
  const paginatedTx = useMemo(() => {
    const start = (currentPageNum - 1) * itemsPerPage;
    return filteredTx.slice(start, start + itemsPerPage);
  }, [filteredTx, currentPageNum]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    addToast('success', 'Copied', 'Transaction identifier copied.');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0f1523] border border-white/5">
        <div>
          <h2 className="font-bold text-base text-white">Transaction History</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Activity history for practice trades, swaps, transfers, and portfolio updates
          </p>
        </div>

        <button
          onClick={exportPortfolioCSV}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0f1523] border border-white/5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by token, Tx hash (e.g. NX-SIM-...), or note..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPageNum(1);
            }}
            className="w-full bg-[#0a0e17] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPageNum(1);
            }}
            className="bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
            <option value="swap">Swap</option>
            <option value="send">Send</option>
            <option value="receive">Receive</option>
            <option value="deposit">Deposit</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPageNum(1);
            }}
            className="bg-[#0a0e17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-[#0f1523] border border-white/5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0a0e17]/80 text-slate-400 border-b border-white/5 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 pl-4">Type</th>
                <th className="py-3.5">Asset / Pair</th>
                <th className="py-3.5">Amount</th>
                <th className="py-3.5">Total Value</th>
                <th className="py-3.5 hidden md:table-cell">Fee</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5">Date & Time</th>
                <th className="py-3.5 pr-4 text-right">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 font-mono">
              {paginatedTx.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                    <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm">No transactions match your search criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedTx.map((tx) => {
                  const isPositiveFlow =
                    tx.type === 'buy' || tx.type === 'receive' || tx.type === 'deposit';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => setSelectedTxDetail(tx)}
                    >
                      {/* Type Badge */}
                      <td className="py-4 pl-4 font-sans">
                        <div className="flex items-center gap-2">
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

                      {/* Asset */}
                      <td className="py-4 font-sans">
                        <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {tx.assetSymbol}
                          {tx.counterAssetSymbol && (
                            <span className="text-slate-400"> → {tx.counterAssetSymbol}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                          {tx.hash}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 font-bold text-white">
                        <span className={isPositiveFlow ? 'text-emerald-400' : 'text-slate-200'}>
                          {isPositiveFlow ? '+' : '-'}{tx.amount} {tx.assetSymbol}
                        </span>
                        {tx.counterAmount && (
                          <div className="text-[10px] text-purple-300 font-normal">
                            +{tx.counterAmount} {tx.counterAssetSymbol}
                          </div>
                        )}
                      </td>

                      {/* Simulated Value */}
                      <td className="py-4 font-bold text-cyan-300">
                        {formatCurrency(tx.totalValueUSD)}
                      </td>

                      {/* Fee */}
                      <td className="py-4 text-slate-400 hidden md:table-cell">
                        ${tx.feeUSD.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{formatTransactionStatus(tx.status)}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 text-slate-400 text-[11px]">
                        {new Date(tx.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Receipt Action */}
                      <td className="py-4 pr-4 text-right font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTxDetail(tx);
                          }}
                          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5 text-xs text-slate-400">
            <div>
              Showing page <strong className="text-white">{currentPageNum}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong> ({filteredTx.length} records)
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPageNum === 1}
                onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPageNum === totalPages}
                onClick={() => setCurrentPageNum((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Receipt Modal */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#111726] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Transaction Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 font-mono text-xs">
              <div className="text-center pb-2">
                <div className="text-2xl font-bold text-white">
                  {selectedTxDetail.amount} {selectedTxDetail.assetSymbol}
                </div>
                <div className="text-cyan-400 font-semibold mt-1">
                  {formatCurrency(selectedTxDetail.totalValueUSD)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Type:</span>
                  <span className="text-white uppercase font-bold">{selectedTxDetail.type}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">{formatTransactionStatus(selectedTxDetail.status)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Transaction Hash:</span>
                  <div className="flex items-center gap-1 text-slate-200">
                    <span>{selectedTxDetail.hash}</span>
                    <button
                      onClick={() => handleCopy(selectedTxDetail.hash)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Fee:</span>
                  <span className="text-slate-200">${selectedTxDetail.feeUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Timestamp:</span>
                  <span className="text-slate-200">
                    {new Date(selectedTxDetail.timestamp).toUTCString()}
                  </span>
                </div>
                {selectedTxDetail.recipientAddress && (
                  <div className="flex justify-between text-slate-400">
                    <span>Recipient:</span>
                    <span className="text-cyan-400 truncate max-w-[180px]">
                      {selectedTxDetail.recipientAddress}
                    </span>
                  </div>
                )}
                {selectedTxDetail.note && (
                  <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 font-sans">
                    {formatTransactionNote(selectedTxDetail.note)}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-slate-300 font-sans leading-relaxed">
                Record confirmed and cataloged within the NOVEXA institutional transaction ledger.
              </div>

              <button
                onClick={() => setSelectedTxDetail(null)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-sans font-bold text-xs transition-colors cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
