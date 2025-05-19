import { PublicKey } from '@solana/web3.js';

export interface SolanaTransaction {
  signature: string;
  slot: number;
  err: any | null;
  memo: string | null;
  blockTime: number;
  confirmationStatus: string;
  [key: string]: any;
}

export interface TransactionPageInfo {
  page: number;
  blocktime: number;
  lastSignature: string;
  nb_transaction: number;
}

export interface TransactionSummary {
  address: string;
  firstTransactionDate: string;
  nb_all_transactions: number;
  pages: TransactionPageInfo[];
}

export interface FetchTransactionsOptions {
  rpcUrl: string;
  address: string;
  limit?: number;
  before?: string;
  until?: string;
}

export interface FetchTransactionDetailsOptions {
  rpcUrl: string;
  signature: string;
  encoding?: 'json' | 'jsonParsed' | 'base58' | 'base64';
  maxSupportedTransactionVersion?: number;
}

export interface TransactionDetail {
  signature: string;
  blockTime: number;
  slot: number;
  fee: number;
  err: any | null;
  memo: string | null;
  status: 'confirmed' | 'finalized' | 'processed' | 'failed';
  parsedTransaction?: any;
  raw?: any;
}

export interface SaveTransactionsOptions {
  basePath: string;
  address: string;
  pageNumber: number;
  transactions: SolanaTransaction[];
  summary?: TransactionSummary;
}

export interface TransactionStorageInfo {
  address: string;
  pages: number;
  totalTransactions: number;
  firstDate: string;
  lastDate: string;
}
