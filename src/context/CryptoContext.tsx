import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  CryptoAsset,
  Holding,
  Transaction,
  UserSettings,
  AppNotification,
  TransactionStatus
} from '../types/crypto';
import {
  INITIAL_ASSETS,
  INITIAL_HOLDINGS,
  INITIAL_CASH_BALANCE,
  INITIAL_TRANSACTIONS,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATIONS
} from '../services/mockData';
import { soundManager } from '../utils/audio';
import { SUBSCRIPTION_DURATION_DAYS, SUBSCRIPTION_PLANS } from '../services/subscriptionPlans';
import { useAuth } from './AuthContext';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export type PortfolioTier = 'starter' | 'pro' | 'institutional' | 'sovereign' | 'prime';

export interface SubscriptionCreditEntry {
  id: string;
  activationId: string;
  planId: number;
  day: number;
  amount: number;
  creditedAt: number;
}

interface SubscriptionState {
  activePlanId: number | null;
  activationId: string | null;
  activatedAt: number | null;
  creditedDays: number;
  simulatedBalance: number;
  history: SubscriptionCreditEntry[];
}

const SUBSCRIPTION_DAY_MS = 24 * 60 * 60 * 1000;
const SUBSCRIPTION_PLAN_CREDITS = Object.fromEntries(
  SUBSCRIPTION_PLANS.map((plan) => [plan.id, plan.dailyCreditUsd])
) as Record<number, number>;
const EMPTY_SUBSCRIPTION_STATE: SubscriptionState = {
  activePlanId: null,
  activationId: null,
  activatedAt: null,
  creditedDays: 0,
  simulatedBalance: 0,
  history: []
};

export const PORTFOLIO_TIER_CONFIG: Record<
  PortfolioTier,
  { label: string; targetUSD: number; description: string }
> = {
  starter: { label: 'Starter ($100K)', targetUSD: 100000, description: 'Standard $100K portfolio scale' },
  pro: { label: 'Pro Desk ($2.5M)', targetUSD: 2500000, description: 'Family office $2.5M test portfolio' },
  institutional: { label: 'Institutional ($85M)', targetUSD: 85000000, description: 'Prime brokerage $85M allocation' },
  sovereign: { label: 'Sovereign ($1.25B)', targetUSD: 1250000000, description: 'Sovereign reserve portfolio scale' },
  prime: { label: 'Global Prime ($9.8B)', targetUSD: 9800000000, description: 'Tier-1 market maker $9.8B liquidity' }
};

interface CryptoContextType {
  assets: CryptoAsset[];
  holdings: Holding[];
  cashBalance: number;
  transactions: Transaction[];
  settings: UserSettings;
  notifications: AppNotification[];
  toasts: Toast[];
  hideBalance: boolean;
  toggleHideBalance: () => void;
  portfolioTier: PortfolioTier;
  setPortfolioScale: (tier: PortfolioTier) => void;
  subscriptionState: SubscriptionState;
  activateSubscription: (planId: number) => boolean;
  processSubscriptionCredits: () => void;
  // Actions
  addToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetAllDemoData: () => void;
  addSimulatedCash: (amount: number) => void;
  // Trading and Transfers
  executeTrade: (params: {
    type: 'buy' | 'sell';
    assetId: string;
    amountCrypto: number;
    pricePerUnit: number;
    feeUSD: number;
  }) => { success: boolean; message: string };
  executeSwap: (params: {
    fromAssetId: string;
    toAssetId: string;
    fromAmount: number;
    toAmount: number;
    feeUSD: number;
  }) => { success: boolean; message: string };
  executeSend: (params: {
    assetId: string;
    amount: number;
    recipientAddress: string;
    feeUSD: number;
    network: string;
    note?: string;
  }) => { success: boolean; message: string };
  executeSimulateDeposit: (params: {
    assetId: string;
    amount: number;
    senderAddress?: string;
  }) => { success: boolean; message: string };
  addOrUpdateHolding: (params: {
    assetId: string;
    amount: number;
    averageBuyPrice: number;
  }) => void;
  removeHolding: (assetId: string) => void;
  // Calculations & Formatters
  formatCurrency: (valInUSD: number, options?: { compact?: boolean; respectPrivacy?: boolean }) => string;
  formatCrypto: (val: number, symbol: string) => string;
  totalPortfolioValue: number;
  totalCryptoValue: number;
  portfolioPnL24hUSD: number;
  portfolioPnL24hPct: number;
  portfolioTotalPnLUSD: number;
  portfolioTotalPnLPct: number;
  exportPortfolioCSV: () => void;
  getAssetById: (id: string) => CryptoAsset | undefined;
  getHoldingByAssetId: (id: string) => Holding | undefined;
}

const STORAGE_KEY = 'nexora_crypto_state_v1';
const LEGACY_STATE_MIGRATION_KEY = `${STORAGE_KEY}_owner_migration_v1`;

const readSubscriptionState = (storageKey: string): SubscriptionState => {
  try {
    const saved = localStorage.getItem(`${storageKey}_subscription`);
    if (!saved) return EMPTY_SUBSCRIPTION_STATE;
    const parsed = JSON.parse(saved) as Partial<SubscriptionState>;
    const activatedAt = typeof parsed.activatedAt === 'number' ? parsed.activatedAt : null;
    const activePlanId = Number.isInteger(parsed.activePlanId)
      ? parsed.activePlanId as number
      : activatedAt !== null ? 1 : null;
    const activationId = typeof parsed.activationId === 'string'
      ? parsed.activationId
      : activatedAt !== null ? `legacy-${activatedAt}` : null;
    const history = Array.isArray(parsed.history)
      ? parsed.history.map((entry) => {
          const legacyActivationId = entry.activationId || `legacy-${activatedAt ?? 0}`;
          const legacyPlanId = Number.isInteger(entry.planId) ? entry.planId : 1;
          return {
            ...entry,
            activationId: legacyActivationId,
            planId: legacyPlanId,
            id: entry.activationId ? entry.id : `subscription-plan-${legacyPlanId}-${legacyActivationId}-day-${entry.day}`
          };
        })
      : [];
    return {
      activePlanId,
      activationId,
      activatedAt,
      creditedDays: Number.isInteger(parsed.creditedDays) ? Math.min(SUBSCRIPTION_DURATION_DAYS, Math.max(0, parsed.creditedDays as number)) : 0,
      simulatedBalance: typeof parsed.simulatedBalance === 'number' && parsed.simulatedBalance >= 0 ? parsed.simulatedBalance : 0,
      history
    };
  } catch {
    return EMPTY_SUBSCRIPTION_STATE;
  }
};

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

const CURRENCY_RATES = {
  USD: { symbol: '$', rate: 1.0 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.77 },
  JPY: { symbol: '¥', rate: 152.4 }
};

export const CryptoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const storageKey = `${STORAGE_KEY}_${user?.id ?? 'owner'}`;
  const subscriptionStorageKey = `${storageKey}_subscription`;

  if (user?.id) {
    try {
      if (localStorage.getItem(LEGACY_STATE_MIGRATION_KEY) !== 'true') {
        const stateParts = ['assets', 'holdings', 'cash', 'txs', 'settings', 'notifs', 'hideBalance', 'tier', 'subscription'];
        stateParts.forEach((part) => {
          const legacyKey = `${STORAGE_KEY}_${part}`;
          const ownerKey = part === 'subscription' ? subscriptionStorageKey : `${storageKey}_${part}`;
          if (localStorage.getItem(ownerKey) === null) {
            const legacyValue = localStorage.getItem(legacyKey);
            if (legacyValue !== null) localStorage.setItem(ownerKey, legacyValue);
          }
        });
        localStorage.setItem(LEGACY_STATE_MIGRATION_KEY, 'true');
      }
    } catch (error) {
      console.error('Existing local demo state could not be migrated:', error);
    }
  }

  // Load state from localStorage or initialize
  const [assets, setAssets] = useState<CryptoAsset[]>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_assets`);
      return saved ? JSON.parse(saved) : INITIAL_ASSETS;
    } catch {
      return INITIAL_ASSETS;
    }
  });

  const [holdings, setHoldings] = useState<Holding[]>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_holdings`);
      return saved ? JSON.parse(saved) : INITIAL_HOLDINGS;
    } catch {
      return INITIAL_HOLDINGS;
    }
  });

  const [cashBalance, setCashBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_cash`);
      return saved ? JSON.parse(saved) : INITIAL_CASH_BALANCE;
    } catch {
      return INITIAL_CASH_BALANCE;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_txs`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_settings`);
      const storedSettings = saved ? JSON.parse(saved) as UserSettings : INITIAL_SETTINGS;
      return {
        ...storedSettings,
        userName: user?.name ?? storedSettings.userName,
        userEmail: user?.email ?? storedSettings.userEmail
      };
    } catch {
      return {
        ...INITIAL_SETTINGS,
        userName: user?.name ?? INITIAL_SETTINGS.userName,
        userEmail: user?.email ?? INITIAL_SETTINGS.userEmail
      };
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_notifs`);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hideBalance, setHideBalance] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${storageKey}_hideBalance`) === 'true';
    } catch {
      return false;
    }
  });

  const [portfolioTier, setPortfolioTier] = useState<PortfolioTier>(() => {
    try {
      return (localStorage.getItem(`${storageKey}_tier`) as PortfolioTier) || 'starter';
    } catch {
      return 'starter';
    }
  });

  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>(() => readSubscriptionState(storageKey));

  const processSubscriptionCredits = useCallback(() => {
    const current = readSubscriptionState(storageKey);
    if (current.activatedAt === null || current.activationId === null || current.activePlanId === null) return;

    const elapsedDays = Math.min(
      SUBSCRIPTION_DURATION_DAYS,
      Math.max(0, Math.floor((Date.now() - current.activatedAt) / SUBSCRIPTION_DAY_MS))
    );
    const newCredits = elapsedDays - current.creditedDays;
    if (newCredits <= 0) return;
    const dailyCredit = SUBSCRIPTION_PLAN_CREDITS[current.activePlanId];
    if (!dailyCredit) return;

    const entries = Array.from({ length: newCredits }, (_, index) => {
      const day = current.creditedDays + index + 1;
      return {
        id: `subscription-plan-${current.activePlanId}-${current.activationId}-day-${day}`,
        activationId: current.activationId!,
        planId: current.activePlanId!,
        day,
        amount: dailyCredit,
        creditedAt: current.activatedAt! + day * SUBSCRIPTION_DAY_MS
      };
    });
    const uniqueHistory = Array.from(
      new Map([...entries, ...current.history].map((entry) => [entry.id, entry])).values()
    ).sort((left, right) => right.day - left.day);
    const updated: SubscriptionState = {
      ...current,
      creditedDays: elapsedDays,
      simulatedBalance: uniqueHistory
        .filter((entry) => entry.activationId === current.activationId)
        .reduce((total, entry) => total + entry.amount, 0),
      history: uniqueHistory
    };

    try {
      localStorage.setItem(subscriptionStorageKey, JSON.stringify(updated));
    } catch (error) {
      console.error('Subscription demo state could not be persisted:', error);
    }
    setSubscriptionState(updated);
  }, []);

  const activateSubscription = useCallback((planId: number) => {
    if (!SUBSCRIPTION_PLAN_CREDITS[planId]) return false;
    const current = readSubscriptionState(storageKey);
    const activatedAt = Date.now();
    const activationId = `plan-${planId}-${activatedAt}-${Math.random().toString(36).slice(2, 8)}`;
    const updated: SubscriptionState = {
      ...current,
      activePlanId: planId,
      activationId,
      activatedAt,
      creditedDays: 0,
      simulatedBalance: 0
    };
    try {
      localStorage.setItem(subscriptionStorageKey, JSON.stringify(updated));
    } catch (error) {
      console.error('Subscription activation could not be saved:', error);
      return false;
    }
    setSubscriptionState(updated);
    return true;
  }, []);

  useEffect(() => {
    processSubscriptionCredits();
    const interval = setInterval(processSubscriptionCredits, 60_000);
    return () => clearInterval(interval);
  }, [processSubscriptionCredits]);

  const toggleHideBalance = useCallback(() => {
    setHideBalance((prev) => {
      const next = !prev;
      localStorage.setItem(`${storageKey}_hideBalance`, String(next));
      soundManager.playClick(true);
      return next;
    });
  }, []);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_assets`, JSON.stringify(assets));
      localStorage.setItem(`${storageKey}_holdings`, JSON.stringify(holdings));
      localStorage.setItem(`${storageKey}_cash`, JSON.stringify(cashBalance));
      localStorage.setItem(`${storageKey}_txs`, JSON.stringify(transactions));
      localStorage.setItem(`${storageKey}_settings`, JSON.stringify(settings));
      localStorage.setItem(`${storageKey}_notifs`, JSON.stringify(notifications));
      localStorage.setItem(`${storageKey}_tier`, portfolioTier);
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
  }, [assets, holdings, cashBalance, transactions, settings, notifications, portfolioTier]);

  // Toast Helpers
  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Settings
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    soundManager.playClick(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Reset Data
  const resetAllDemoData = useCallback(() => {
    setAssets(INITIAL_ASSETS);
    setHoldings(INITIAL_HOLDINGS);
    setCashBalance(INITIAL_CASH_BALANCE);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setPortfolioTier('starter');
    setHideBalance(false);
    setSubscriptionState(EMPTY_SUBSCRIPTION_STATE);
    localStorage.removeItem(`${storageKey}_assets`);
    localStorage.removeItem(`${storageKey}_holdings`);
    localStorage.removeItem(`${storageKey}_cash`);
    localStorage.removeItem(`${storageKey}_txs`);
    localStorage.removeItem(`${storageKey}_settings`);
    localStorage.removeItem(`${storageKey}_notifs`);
    localStorage.removeItem(`${storageKey}_tier`);
    localStorage.removeItem(`${storageKey}_hideBalance`);
    localStorage.removeItem(subscriptionStorageKey);
    soundManager.playSuccess(true);
    addToast('info', 'Portfolio Restored', 'Practice balances, assets, and activity history have been restored to the initial state.');
  }, [addToast]);

  const addSimulatedCash = useCallback((amount: number) => {
    setCashBalance((prev) => prev + amount);
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'deposit',
      assetSymbol: 'USD',
      amount,
      pricePerUnit: 1.0,
      totalValueUSD: amount,
      feeUSD: 0,
      timestamp: new Date().toISOString(),
      status: 'Simulated — Completed',
      hash: `NX-SIM-${Math.floor(10000000 + Math.random() * 90000000)}`,
      note: 'Simulated Sandbox Funding Grant'
    };
    setTransactions((prev) => [newTx, ...prev]);
    soundManager.playSuccess(settings.soundEnabled);
    addToast('success', 'Practice Funds Added', `Added +$${amount.toLocaleString()} to your local practice balance. This is not a real deposit.`);
  }, [addToast, settings.soundEnabled]);

  // Scale Portfolio to Target Tier (e.g. $100K, $2.5M, $85M, $1.25B, $9.8B)
  const setPortfolioScale = useCallback(
    (tier: PortfolioTier) => {
      const targetUSD = PORTFOLIO_TIER_CONFIG[tier]?.targetUSD;
      if (!targetUSD) return;

      // Current total portfolio
      const currentCrypto = holdings.reduce((sum, h) => {
        const a = assets.find((item) => item.id === h.assetId);
        return sum + (a ? a.price * h.amount : 0);
      }, 0);
      const currentTotal = currentCrypto + cashBalance;

      if (currentTotal <= 0) return;

      const scale = targetUSD / currentTotal;

      // Scale holdings and cash with high precision
      setHoldings((prev) =>
        prev.map((h) => ({
          ...h,
          amount: +(h.amount * scale).toFixed(h.amount > 10 ? 2 : 4)
        }))
      );
      setCashBalance((prev) => +(prev * scale).toFixed(2));
      setPortfolioTier(tier);

      // Record in ledger
      const tierLabel = PORTFOLIO_TIER_CONFIG[tier].label;
      const rebalanceTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'deposit',
        assetSymbol: 'USD',
        amount: targetUSD,
        pricePerUnit: 1.0,
        totalValueUSD: targetUSD,
        feeUSD: 0,
        timestamp: new Date().toISOString(),
        status: 'Simulated — Completed',
        hash: `NX-TIER-${Math.floor(10000000 + Math.random() * 90000000)}`,
        note: `Simulated Scale Rebalance to ${tierLabel}`
      };
      setTransactions((prev) => [rebalanceTx, ...prev]);

      soundManager.playSuccess(true);
      addToast(
        'success',
        'Portfolio Scale Adjusted',
        `Practice portfolio adjusted to ${tierLabel} with consistent asset allocation.`
      );
    },
    [holdings, assets, cashBalance, addToast]
  );

  // Asset Lookups
  const getAssetById = useCallback((id: string) => assets.find((a) => a.id === id), [assets]);
  const getHoldingByAssetId = useCallback((id: string) => holdings.find((h) => h.assetId === id), [holdings]);

  // Formatters with Full & Large Number Precision
  const formatCurrency = useCallback(
    (valInUSD: number, options?: { compact?: boolean; respectPrivacy?: boolean }) => {
      if (options?.respectPrivacy !== false && hideBalance) {
        return '••••••••';
      }

      const curr = CURRENCY_RATES[settings.currency] || CURRENCY_RATES.USD;
      const converted = valInUSD * curr.rate;
      const abs = Math.abs(converted);
      const sign = converted < 0 ? '-' : '';

      if (options?.compact) {
        if (abs >= 1_000_000_000) {
          return `${sign}${curr.symbol}${(abs / 1_000_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B`;
        }
        if (abs >= 1_000_000) {
          return `${sign}${curr.symbol}${(abs / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
        }
        if (abs >= 100_000) {
          return `${sign}${curr.symbol}${(abs / 1_000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}K`;
        }
      }

      // High-volume display
      if (abs >= 1_000_000_000) {
        return `${sign}${curr.symbol}${(abs / 1_000_000_000).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}B`;
      }
      if (abs >= 100_000_000) {
        return `${sign}${curr.symbol}${(abs / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
      }

      return `${sign}${curr.symbol}${abs.toLocaleString('en-US', {
        minimumFractionDigits: abs < 1 ? 4 : 2,
        maximumFractionDigits: abs < 1 ? 4 : 2
      })}`;
    },
    [settings.currency, hideBalance]
  );

  const formatCrypto = useCallback((val: number, symbol: string) => {
    return `${val.toLocaleString('en-US', {
      minimumFractionDigits: val < 0.01 ? 4 : 2,
      maximumFractionDigits: val < 0.0001 ? 6 : 4
    })} ${symbol}`;
  }, []);

  // Live Simulated Price Tick Engine (Simulates realistic micro-market movements every 4 seconds)
  useEffect(() => {
    if (!settings.autoTick) return;

    const interval = setInterval(() => {
      setAssets((prevAssets) => {
        return prevAssets.map((asset) => {
          // Stablecoins stay tight around $1.00
          if (asset.category === 'stablecoin') {
            const jitter = (Math.random() - 0.5) * 0.0008;
            const newPrice = Math.max(0.998, Math.min(1.002, +(asset.price + jitter).toFixed(4)));
            return { ...asset, price: newPrice };
          }

          // Micro-movement between -0.3% and +0.35%
          const pctChange = (Math.random() - 0.48) * 0.006;
          const newPrice = Math.max(0.01, +(asset.price * (1 + pctChange)).toFixed(asset.price > 10 ? 2 : 4));
          const newSparkline = [...asset.sparkline.slice(1), newPrice];

          return {
            ...asset,
            price: newPrice,
            sparkline: newSparkline,
            high24h: Math.max(asset.high24h, newPrice),
            low24h: Math.min(asset.low24h, newPrice)
          };
        });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [settings.autoTick]);

  // Derived Portfolio Totals
  const totalCryptoValue = useMemo(() => {
    return holdings.reduce((sum, h) => {
      const asset = assets.find((a) => a.id === h.assetId);
      return sum + (asset ? asset.price * h.amount : 0);
    }, 0);
  }, [holdings, assets]);

  const totalPortfolioValue = useMemo(() => {
    return totalCryptoValue + cashBalance;
  }, [totalCryptoValue, cashBalance]);

  const portfolioPnL24hUSD = useMemo(() => {
    return holdings.reduce((sum, h) => {
      const asset = assets.find((a) => a.id === h.assetId);
      if (!asset) return sum;
      const currentVal = asset.price * h.amount;
      const dailyDelta = currentVal * (asset.change24h / 100);
      return sum + dailyDelta;
    }, 0);
  }, [holdings, assets]);

  const portfolioPnL24hPct = useMemo(() => {
    if (totalPortfolioValue <= 0) return 0;
    return (portfolioPnL24hUSD / totalPortfolioValue) * 100;
  }, [portfolioPnL24hUSD, totalPortfolioValue]);

  const portfolioTotalPnLUSD = useMemo(() => {
    return holdings.reduce((sum, h) => {
      const asset = assets.find((a) => a.id === h.assetId);
      if (!asset) return sum;
      const currentVal = asset.price * h.amount;
      const costBasis = h.averageBuyPrice * h.amount;
      return sum + (currentVal - costBasis);
    }, 0);
  }, [holdings, assets]);

  const portfolioTotalPnLPct = useMemo(() => {
    const totalCostBasis = holdings.reduce((sum, h) => sum + h.averageBuyPrice * h.amount, 0);
    if (totalCostBasis <= 0) return 0;
    return (portfolioTotalPnLUSD / totalCostBasis) * 100;
  }, [holdings, portfolioTotalPnLUSD]);

  // Execute Simulated Trade
  const executeTrade = useCallback(
    ({
      type,
      assetId,
      amountCrypto,
      pricePerUnit,
      feeUSD
    }: {
      type: 'buy' | 'sell';
      assetId: string;
      amountCrypto: number;
      pricePerUnit: number;
      feeUSD: number;
    }) => {
      const asset = assets.find((a) => a.id === assetId);
      if (!asset) {
        soundManager.playError(settings.soundEnabled);
        return { success: false, message: 'Invalid asset specified.' };
      }

      if (amountCrypto <= 0) {
        soundManager.playError(settings.soundEnabled);
        return { success: false, message: 'Amount must be greater than zero.' };
      }

      const totalCostUSD = amountCrypto * pricePerUnit + (type === 'buy' ? feeUSD : -feeUSD);

      if (type === 'buy') {
        if (cashBalance < totalCostUSD) {
          soundManager.playError(settings.soundEnabled);
          return {
            success: false,
            message: `Insufficient practice balance. Required: $${totalCostUSD.toFixed(2)}, available: $${cashBalance.toFixed(2)}`
          };
        }

        // Deduct cash
        setCashBalance((prev) => prev - totalCostUSD);

        // Update or add holding
        setHoldings((prev) => {
          const existing = prev.find((h) => h.assetId === assetId);
          if (existing) {
            const newAmount = existing.amount + amountCrypto;
            const newAvgPrice = (existing.amount * existing.averageBuyPrice + amountCrypto * pricePerUnit) / newAmount;
            return prev.map((h) =>
              h.assetId === assetId
                ? {
                    ...h,
                    amount: newAmount,
                    averageBuyPrice: newAvgPrice,
                    lastUpdated: new Date().toISOString()
                  }
                : h
            );
          } else {
            return [
              ...prev,
              {
                assetId,
                symbol: asset.symbol,
                amount: amountCrypto,
                averageBuyPrice: pricePerUnit,
                lastUpdated: new Date().toISOString()
              }
            ];
          }
        });
      } else {
        // Sell
        const existing = holdings.find((h) => h.assetId === assetId);
        if (!existing || existing.amount < amountCrypto) {
          soundManager.playError(settings.soundEnabled);
          return {
            success: false,
            message: `Insufficient ${asset.symbol} balance. You hold ${existing ? existing.amount : 0} ${asset.symbol}`
          };
        }

        // Add proceeds to cash (after fee)
        const proceeds = amountCrypto * pricePerUnit - feeUSD;
        setCashBalance((prev) => prev + proceeds);

        // Reduce holding
        setHoldings((prev) => {
          return prev
            .map((h) => {
              if (h.assetId === assetId) {
                const remaining = h.amount - amountCrypto;
                return remaining > 0.000001
                  ? { ...h, amount: remaining, lastUpdated: new Date().toISOString() }
                  : null;
              }
              return h;
            })
            .filter(Boolean) as Holding[];
        });
      }

      // Record in transaction history
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        type,
        assetSymbol: asset.symbol,
        amount: amountCrypto,
        pricePerUnit,
        totalValueUSD: amountCrypto * pricePerUnit,
        feeUSD,
        timestamp: new Date().toISOString(),
        status: 'Simulated — Completed',
        hash: `NX-SIM-${Math.floor(10000000 + Math.random() * 90000000)}`,
        note: `Practice ${type.toUpperCase()} entry on NEXORA`
      };
      setTransactions((prev) => [tx, ...prev]);

      soundManager.playSuccess(settings.soundEnabled);
      addToast(
        'success',
        `Order Filled (${type.toUpperCase()})`,
        `Recorded a practice ${type} of ${amountCrypto} ${asset.symbol} at the modeled price of $${pricePerUnit.toLocaleString()}. No live order was submitted.`
      );

      return { success: true, message: 'Practice order recorded locally. No live order was submitted.' };
    },
    [assets, cashBalance, holdings, settings.soundEnabled, addToast]
  );

  // Execute Simulated Swap
  const executeSwap = useCallback(
    ({
      fromAssetId,
      toAssetId,
      fromAmount,
      toAmount,
      feeUSD
    }: {
      fromAssetId: string;
      toAssetId: string;
      fromAmount: number;
      toAmount: number;
      feeUSD: number;
    }) => {
      const fromAsset = assets.find((a) => a.id === fromAssetId);
      const toAsset = assets.find((a) => a.id === toAssetId);
      if (!fromAsset || !toAsset) {
        soundManager.playError(settings.soundEnabled);
        return { success: false, message: 'Invalid assets for swap.' };
      }

      const existingFrom = holdings.find((h) => h.assetId === fromAssetId);
      if (!existingFrom || existingFrom.amount < fromAmount) {
        soundManager.playError(settings.soundEnabled);
        return {
          success: false,
          message: `Insufficient ${fromAsset.symbol} balance to complete swap.`
        };
      }

      // Update holdings: deduct fromAsset, add toAsset
      setHoldings((prev) => {
        let updated = prev.map((h) => {
          if (h.assetId === fromAssetId) {
            const remaining = h.amount - fromAmount;
            return remaining > 0.000001
              ? { ...h, amount: remaining, lastUpdated: new Date().toISOString() }
              : null;
          }
          return h;
        }).filter(Boolean) as Holding[];

        const existingTo = updated.find((h) => h.assetId === toAssetId);
        if (existingTo) {
          const newAmount = existingTo.amount + toAmount;
          const newAvgPrice = (existingTo.amount * existingTo.averageBuyPrice + toAmount * toAsset.price) / newAmount;
          updated = updated.map((h) =>
            h.assetId === toAssetId
              ? { ...h, amount: newAmount, averageBuyPrice: newAvgPrice, lastUpdated: new Date().toISOString() }
              : h
          );
        } else {
          updated.push({
            assetId: toAssetId,
            symbol: toAsset.symbol,
            amount: toAmount,
            averageBuyPrice: toAsset.price,
            lastUpdated: new Date().toISOString()
          });
        }

        return updated;
      });

      // Record transaction
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'swap',
        assetSymbol: fromAsset.symbol,
        amount: fromAmount,
        counterAssetSymbol: toAsset.symbol,
        counterAmount: toAmount,
        pricePerUnit: fromAsset.price,
        totalValueUSD: fromAmount * fromAsset.price,
        feeUSD,
        timestamp: new Date().toISOString(),
        status: 'Simulated — Completed',
        hash: `NX-SWAP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        note: `Instant liquidity swap route (${fromAsset.symbol} -> ${toAsset.symbol})`
      };
      setTransactions((prev) => [tx, ...prev]);

      soundManager.playSuccess(settings.soundEnabled);
      addToast(
        'success',
        'Practice Swap Recorded',
        `Recorded a local practice swap of ${fromAmount} ${fromAsset.symbol} for ${toAmount.toFixed(4)} ${toAsset.symbol}. No network transaction was submitted.`
      );

      return { success: true, message: 'Practice swap recorded locally. No network transaction was submitted.' };
    },
    [assets, holdings, settings.soundEnabled, addToast]
  );

  // Execute Simulated Send
  const executeSend = useCallback(
    ({
      assetId,
      amount,
      recipientAddress,
      feeUSD,
      network,
      note
    }: {
      assetId: string;
      amount: number;
      recipientAddress: string;
      feeUSD: number;
      network: string;
      note?: string;
    }) => {
      const asset = assets.find((a) => a.id === assetId);
      if (!asset) return { success: false, message: 'Asset not found.' };

      const existing = holdings.find((h) => h.assetId === assetId);
      if (!existing || existing.amount < amount) {
        soundManager.playError(settings.soundEnabled);
        return {
          success: false,
          message: `Insufficient ${asset.symbol} balance. Available: ${existing ? existing.amount : 0}`
        };
      }

      // Deduct from holdings
      setHoldings((prev) => {
        return prev
          .map((h) => {
            if (h.assetId === assetId) {
              const remaining = h.amount - amount;
              return remaining > 0.000001
                ? { ...h, amount: remaining, lastUpdated: new Date().toISOString() }
                : null;
            }
            return h;
          })
          .filter(Boolean) as Holding[];
      });

      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'send',
        assetSymbol: asset.symbol,
        amount,
        pricePerUnit: asset.price,
        totalValueUSD: amount * asset.price,
        feeUSD,
        timestamp: new Date().toISOString(),
        status: 'Simulated — Completed',
        hash: `NX-TX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        recipientAddress,
        network,
        note: note || `Practice transfer entry to ${recipientAddress.substring(0, 10)}...`
      };
      setTransactions((prev) => [tx, ...prev]);

      soundManager.playSuccess(settings.soundEnabled);
      addToast(
        'success',
        'Practice Transfer Recorded',
        `Recorded ${amount} ${asset.symbol} as local practice activity. No transfer was broadcast and no assets were sent.`
      );

      return { success: true, message: 'Practice transfer recorded locally. No assets were sent.' };
    },
    [assets, holdings, settings.soundEnabled, addToast]
  );

  // Execute Simulated Deposit (Demonstrates receiving incoming crypto)
  const executeSimulateDeposit = useCallback(
    ({
      assetId,
      amount,
      senderAddress
    }: {
      assetId: string;
      amount: number;
      senderAddress?: string;
    }) => {
      const asset = assets.find((a) => a.id === assetId);
      if (!asset) return { success: false, message: 'Asset not found.' };

      setHoldings((prev) => {
        const existing = prev.find((h) => h.assetId === assetId);
        if (existing) {
          return prev.map((h) =>
            h.assetId === assetId
              ? { ...h, amount: h.amount + amount, lastUpdated: new Date().toISOString() }
              : h
          );
        } else {
          return [
            ...prev,
            {
              assetId,
              symbol: asset.symbol,
              amount,
              averageBuyPrice: asset.price,
              lastUpdated: new Date().toISOString()
            }
          ];
        }
      });

      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'receive',
        assetSymbol: asset.symbol,
        amount,
        pricePerUnit: asset.price,
        totalValueUSD: amount * asset.price,
        feeUSD: 0,
        timestamp: new Date().toISOString(),
        status: 'Simulated — Completed',
        hash: `NX-DEP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        ...(senderAddress ? { senderAddress } : {}),
        network: 'Local Practice Record',
        note: 'Practice deposit entry; no funds received'
      };
      setTransactions((prev) => [tx, ...prev]);

      soundManager.playSuccess(settings.soundEnabled);
      addToast(
        'success',
        'Practice Deposit Entry Added',
        `Added +${amount} ${asset.symbol} to the local practice balance. No funds were received.`
      );

      return { success: true, message: 'Practice deposit entry recorded locally. No funds were received.' };
    },
    [assets, settings.soundEnabled, addToast]
  );

  // Add / Update Custom Holding
  const addOrUpdateHolding = useCallback(
    ({
      assetId,
      amount,
      averageBuyPrice
    }: {
      assetId: string;
      amount: number;
      averageBuyPrice: number;
    }) => {
      const asset = assets.find((a) => a.id === assetId);
      if (!asset) return;

      setHoldings((prev) => {
        const existing = prev.find((h) => h.assetId === assetId);
        if (existing) {
          return prev.map((h) =>
            h.assetId === assetId
              ? { ...h, amount, averageBuyPrice, lastUpdated: new Date().toISOString() }
              : h
          );
        } else {
          return [
            ...prev,
            {
              assetId,
              symbol: asset.symbol,
              amount,
              averageBuyPrice,
              lastUpdated: new Date().toISOString()
            }
          ];
        }
      });

      soundManager.playSuccess(settings.soundEnabled);
      addToast('success', 'Practice Position Updated', `Updated the local practice position in ${asset.name}.`);
    },
    [assets, settings.soundEnabled, addToast]
  );

  const removeHolding = useCallback(
    (assetId: string) => {
      const asset = assets.find((a) => a.id === assetId);
      setHoldings((prev) => prev.filter((h) => h.assetId !== assetId));
      soundManager.playClick(settings.soundEnabled);
      addToast('info', 'Position Removed', `Removed ${asset?.name || 'asset'} from the practice portfolio.`);
    },
    [assets, settings.soundEnabled, addToast]
  );

  // Export Portfolio CSV
  const exportPortfolioCSV = useCallback(() => {
    const rows = [
      ['Asset Name', 'Symbol', 'Quantity', 'Current Price (USD)', 'Total Value (USD)', 'Avg Buy Price', 'Simulated PnL ($)', 'Allocation %'],
      ...holdings.map((h) => {
        const a = assets.find((item) => item.id === h.assetId);
        const price = a ? a.price : 0;
        const totalVal = price * h.amount;
        const pnl = (price - h.averageBuyPrice) * h.amount;
        const alloc = totalPortfolioValue > 0 ? ((totalVal / totalPortfolioValue) * 100).toFixed(2) : '0';
        return [
          a ? a.name : h.symbol,
          h.symbol,
          h.amount.toString(),
          price.toFixed(2),
          totalVal.toFixed(2),
          h.averageBuyPrice.toFixed(2),
          pnl.toFixed(2),
          `${alloc}%`
        ];
      }),
      ['Simulated Cash (USD)', 'USD', cashBalance.toFixed(2), '1.00', cashBalance.toFixed(2), '1.00', '0.00', `${((cashBalance / totalPortfolioValue) * 100).toFixed(2)}%`]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexora_simulated_portfolio_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    soundManager.playSuccess(settings.soundEnabled);
    addToast('success', 'Report Exported', 'Practice portfolio summary downloaded.');
  }, [holdings, assets, totalPortfolioValue, cashBalance, settings.soundEnabled, addToast]);

  const value: CryptoContextType = {
    assets,
    holdings,
    cashBalance,
    transactions,
    settings,
    notifications,
    toasts,
    hideBalance,
    toggleHideBalance,
    portfolioTier,
    setPortfolioScale,
    subscriptionState,
    activateSubscription,
    processSubscriptionCredits,
    addToast,
    removeToast,
    markNotificationRead,
    clearNotifications,
    updateSettings,
    resetAllDemoData,
    addSimulatedCash,
    executeTrade,
    executeSwap,
    executeSend,
    executeSimulateDeposit,
    addOrUpdateHolding,
    removeHolding,
    formatCurrency,
    formatCrypto,
    totalPortfolioValue,
    totalCryptoValue,
    portfolioPnL24hUSD,
    portfolioPnL24hPct,
    portfolioTotalPnLUSD,
    portfolioTotalPnLPct,
    exportPortfolioCSV,
    getAssetById,
    getHoldingByAssetId
  };

  return <CryptoContext.Provider value={value}>{children}</CryptoContext.Provider>;
};

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};
