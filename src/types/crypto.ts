export type AssetCategory = 'layer1' | 'defi' | 'layer2' | 'stablecoin' | 'infrastructure' | 'ai';

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  color: string;
  iconBg: string;
  price: number;
  change24h: number; // percentage
  change7d: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  circulatingSupply: number;
  maxSupply: number | null;
  rank: number;
  category: AssetCategory;
  sparkline: number[]; // 24 hourly points
  description: string;
  demoDepositAddress: string;
}

export interface Holding {
  assetId: string;
  symbol: string;
  amount: number;
  averageBuyPrice: number;
  lastUpdated: string;
}

export type TransactionType = 'buy' | 'sell' | 'swap' | 'send' | 'receive' | 'deposit';

export type TransactionStatus = 'Simulated — Completed' | 'Simulated — Pending' | 'Simulated — Cancelled';

export interface Transaction {
  id: string;
  type: TransactionType;
  assetSymbol: string;
  amount: number;
  pricePerUnit: number;
  totalValueUSD: number;
  feeUSD: number;
  timestamp: string;
  status: TransactionStatus;
  hash: string;
  // Extra fields for swaps and transfers
  counterAssetSymbol?: string;
  counterAmount?: number;
  recipientAddress?: string;
  senderAddress?: string;
  note?: string;
  network?: string;
}

export interface PerformancePoint {
  timestamp: string;
  label: string;
  value: number;
  pnl: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'success' | 'info' | 'warning';
  read: boolean;
}

export interface UserSettings {
  userName: string;
  userEmail: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
  autoTick: boolean;
  soundEnabled: boolean;
  emailAlerts: boolean;
  compactView: boolean;
}
