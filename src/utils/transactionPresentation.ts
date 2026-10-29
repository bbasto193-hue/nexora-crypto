import { TransactionStatus } from '../types/crypto';

// Keep persisted transaction states unchanged while presenting them as practice activity in the UI.
export const formatTransactionStatus = (status: TransactionStatus): string =>
  status.startsWith('Simulated — ')
    ? `Practice · ${status.slice('Simulated — '.length)}`
    : status;

export const formatTransactionNote = (note: string): string => note
  .replace(/demonstration/gi, 'practice')
  .replace(/simulated/gi, 'practice')
  .replace(/simulation/gi, 'practice activity')
  .replace(/sandbox/gi, 'local practice');
