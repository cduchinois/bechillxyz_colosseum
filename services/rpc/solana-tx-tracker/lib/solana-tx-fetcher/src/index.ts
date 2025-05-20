import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PublicKey } from '@solana/web3.js';
import {
  SolanaTransaction,
  TransactionSummary,
  TransactionPageInfo,
  FetchTransactionsOptions,
  SaveTransactionsOptions,
  FetchTransactionDetailsOptions,
  TransactionDetail
} from './types';

/**
 * Validates if the provided string is a valid Solana address
 * @param address - The Solana address to validate
 * @returns boolean indicating if the address is valid
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    if (!address || typeof address !== 'string') {
      return false;
    }
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Fetches transactions for a Solana address
 * @param options - Options for fetching transactions
 * @returns Promise resolving to an array of Solana transactions
 * @throws Error if the address is invalid or if the RPC request fails
 */
export async function fetchTransactions({
  rpcUrl,
  address,
  limit = 100,
  before = undefined,
  until = undefined
}: FetchTransactionsOptions): Promise<SolanaTransaction[]> {
  if (!isValidSolanaAddress(address)) {
    throw new Error('Invalid Solana address');
  }

  if (!rpcUrl || typeof rpcUrl !== 'string') {
    throw new Error('Invalid RPC URL');
  }

  if (limit <= 0 || limit > 1000) {
    throw new Error('Limit must be between 1 and 1000');
  }

  try {
    const requestParams: Record<string, any> = { limit };
    
    if (before) {
      requestParams.before = before;
    }

    if (until) {
      requestParams.until = until;
    }
    
    const params = {
      jsonrpc: '2.0',
      id: 'solana-tx-fetcher',
      method: 'getSignaturesForAddress',
      params: [
        address,
        requestParams
      ]
    };

    const response = await axios.post(rpcUrl, params, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    if (response.data.error) {
      throw new Error(`RPC Error: ${JSON.stringify(response.data.error)}`);
    }
    
    return response.data.result || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`RPC request failed with status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        throw new Error('No response received from RPC server');
      } else {
        throw new Error(`Error setting up request: ${error.message}`);
      }
    }
    throw error;
  }
}

/**
 * Fetches detailed information about a specific transaction
 * @param options - Options for fetching transaction details
 * @returns Promise resolving to transaction details
 * @throws Error if the signature is invalid or if the RPC request fails
 */
export async function fetchTransactionDetails({
  rpcUrl,
  signature,
  encoding = 'json',
  maxSupportedTransactionVersion = 0
}: FetchTransactionDetailsOptions): Promise<TransactionDetail> {
  if (!signature || typeof signature !== 'string') {
    throw new Error('Invalid transaction signature');
  }

  if (!rpcUrl || typeof rpcUrl !== 'string') {
    throw new Error('Invalid RPC URL');
  }

  try {
    // First get basic transaction
    const params = {
      jsonrpc: '2.0',
      id: 'solana-tx-fetcher-detail',
      method: 'getTransaction',
      params: [
        signature,
        { encoding, maxSupportedTransactionVersion }
      ]
    };

    const response = await axios.post(rpcUrl, params, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    if (response.data.error) {
      throw new Error(`RPC Error: ${JSON.stringify(response.data.error)}`);
    }

    if (!response.data.result) {
      throw new Error('Transaction not found');
    }

    const txData = response.data.result;
    
    // Try to get parsed transaction data for more detailed information
    let parsedTx = null;
    try {
      if (encoding !== 'jsonParsed') {
        const parsedParams = {
          jsonrpc: '2.0',
          id: 'solana-tx-fetcher-parsed',
          method: 'getTransaction',
          params: [
            signature,
            { encoding: 'jsonParsed', maxSupportedTransactionVersion }
          ]
        };

        const parsedResponse = await axios.post(rpcUrl, parsedParams, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        });

        if (!parsedResponse.data.error && parsedResponse.data.result) {
          parsedTx = parsedResponse.data.result;
        }
      }
    } catch (parseError) {
      // Continue without parsed data if this fails
      console.warn('Failed to fetch parsed transaction data:', parseError);
    }
    
    // Extract memo if exists
    let memo = null;
    try {
      const instructions = txData.transaction.message.instructions;
      for (const instruction of instructions) {
        if (instruction.programId === 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr') {
          // This is a memo instruction
          if (instruction.data) {
            memo = Buffer.from(instruction.data, 'base64').toString('utf8');
            break;
          }
        }
      }
    } catch (memoError) {
      // Ignore errors in memo extraction
    }

    // Format response
    const result: TransactionDetail = {
      signature,
      blockTime: txData.blockTime,
      slot: txData.slot,
      fee: txData.meta?.fee || 0,
      err: txData.meta?.err,
      memo: memo,
      status: txData.meta?.err ? 'failed' : (txData.confirmationStatus || 'confirmed'),
      parsedTransaction: parsedTx,
      raw: txData
    };

    return result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`RPC request failed with status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        throw new Error('No response received from RPC server');
      } else {
        throw new Error(`Error setting up request: ${error.message}`);
      }
    }
    throw error;
  }
}

/**
 * Saves transaction data to a JSON file
 */
export async function saveTransactions({
  basePath,
  address,
  pageNumber,
  transactions,
  summary
}: SaveTransactionsOptions): Promise<TransactionSummary> {
  try {
    const dirPath = path.join(basePath, 'transactions');
    await fs.ensureDir(dirPath);

    const filename = `${address}_TRANSACTIONS_page-${pageNumber}.json`;
    const filePath = path.join(dirPath, filename);
    await fs.writeJson(filePath, transactions, { spaces: 2 });

    // Get current timestamp
    const now = new Date();
    const timestamp = now.getTime();
    const isoNow = now.toISOString();
    
    // Format a date as DD/MM/YYYY HH:MM:SS
    const formatDate = (timestamp: number): string => {
      const date = new Date(timestamp * 1000);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };
    
    // Create or update summary
    let updatedSummary = summary || {
      address,
      lastUpdated: isoNow,
      lastFetched: isoNow,
      totalPages: 0,
      totalTransactions: 0,
      walletCreationDate: '',
      earliestTransaction: {
        blockTime: 0,
        confirmationStatus: 'finalized',
        err: null,
        memo: null,
        signature: '',
        slot: 0
      },
      pages: [] as TransactionPageInfo[]
    };

    // If we have transactions
    if (transactions.length > 0) {
      // Last transaction in array is the oldest for this page
      const lastTx = transactions[transactions.length - 1];

      // Update the summary with the latest fetch info
      updatedSummary.lastUpdated = isoNow;
      updatedSummary.lastFetched = isoNow;
      
      // Add page info
      const pageInfo: TransactionPageInfo = {
        pageNumber: pageNumber,
        filename: filename,
        transactionCount: transactions.length,
        lastSignature: lastTx.signature,
        lastBlockTime: lastTx.blockTime,
        lastBlockTimeFormatted: formatDate(lastTx.blockTime),
        timestamp: timestamp
      };
      
      // Update or add page info
      const existingPageIndex = updatedSummary.pages.findIndex(p => p.pageNumber === pageNumber);
      if (existingPageIndex !== -1) {
        updatedSummary.pages[existingPageIndex] = pageInfo;
      } else {
        updatedSummary.pages.push(pageInfo);
      }
      
      // Sort pages by page number
      updatedSummary.pages.sort((a, b) => a.pageNumber - b.pageNumber);
      
      // Update totalPages
      updatedSummary.totalPages = updatedSummary.pages.length;
      
      // Update totalTransactions by counting all transactions
      updatedSummary.totalTransactions = updatedSummary.pages.reduce(
        (sum, page) => sum + page.transactionCount, 0
      );
      
      // Check if this is the oldest transaction we've seen
      // Update earliestTransaction and walletCreationDate if needed
      if (!updatedSummary.earliestTransaction || 
          lastTx.blockTime < (updatedSummary.earliestTransaction?.blockTime || Infinity)) {
        
        updatedSummary.earliestTransaction = {
          blockTime: lastTx.blockTime,
          confirmationStatus: lastTx.confirmationStatus || 'finalized',
          err: lastTx.err,
          memo: lastTx.memo,
          signature: lastTx.signature,
          slot: lastTx.slot
        };
        
        updatedSummary.walletCreationDate = formatDate(lastTx.blockTime);
      }
    }
    
    // Save summary file
    const summaryPath = path.join(dirPath, `${address}-summary.json`);
    await fs.writeJson(summaryPath, updatedSummary, { spaces: 2 });
    
    return updatedSummary;
  } catch (error) {
    console.error('Error saving transactions:', error);
    throw error;
  }
}

/**
 * Fetches all transactions for an address, with pagination
 */
export async function fetchAllTransactions(
  rpcUrl: string,
  address: string,
  basePath: string,
  maxPages: number = 10
): Promise<TransactionSummary> {
  if (!isValidSolanaAddress(address)) {
    throw new Error('Invalid Solana address');
  }

  let currentPage = 1;
  let lastSignature: string | undefined = undefined;
  let hasMore = true;
  
  // Get current timestamp
  const now = new Date();
  const isoNow = now.toISOString();
  
  let summary: TransactionSummary = {
    address,
    lastUpdated: isoNow,
    lastFetched: isoNow,
    totalPages: 0,
    totalTransactions: 0,
    walletCreationDate: '',
    earliestTransaction: {
      blockTime: 0,
      confirmationStatus: 'finalized',
      err: null,
      memo: null, 
      signature: '',
      slot: 0
    },
    pages: [] as TransactionPageInfo[]
  };

  try {
    while (hasMore && currentPage <= maxPages) {
      const options: FetchTransactionsOptions = {
        rpcUrl,
        address,
        limit: 100
      };

      if (lastSignature) {
        options.before = lastSignature;
      }

      const transactions = await fetchTransactions(options);
      
      if (transactions.length === 0) {
        hasMore = false;
        break;
      }

      summary = await saveTransactions({
        basePath,
        address,
        pageNumber: currentPage,
        transactions,
        summary
      });

      lastSignature = transactions[transactions.length - 1]?.signature;
      currentPage++;

      if (transactions.length < 100) {
        hasMore = false;
      }
    }

    return summary;
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    throw error;
  }
}

/**
 * Gets the transaction summary for an address
 */
export async function getTransactionSummary(
  basePath: string,
  address: string
): Promise<TransactionSummary | null> {
  try {
    const summaryPath = path.join(basePath, 'transactions', `${address}-summary.json`);
    if (await fs.pathExists(summaryPath)) {
      return await fs.readJson(summaryPath);
    }
    return null;
  } catch (error) {
    console.error('Error reading transaction summary:', error);
    throw error;
  }
}

/**
 * Gets transactions for a specific page
 */
export async function getTransactionsPage(
  basePath: string,
  address: string,
  page: number
): Promise<SolanaTransaction[] | null> {
  try {
    const filePath = path.join(basePath, 'transactions', `${address}-transactions-page-${page}.json`);
    if (await fs.pathExists(filePath)) {
      return await fs.readJson(filePath);
    }
    return null;
  } catch (error) {
    console.error('Error reading transactions page:', error);
    throw error;
  }
}

/**
 * Clears all transaction data for a specific address
 */
export async function clearTransactionData(
  basePath: string,
  address: string
): Promise<boolean> {
  try {
    const transactionsDir = path.join(basePath, 'transactions');
    const summaryPath = path.join(transactionsDir, `${address}-summary.json`);
    
    // Check if summary exists
    if (await fs.pathExists(summaryPath)) {
      // Read summary to get all pages
      const summary = await fs.readJson(summaryPath);
      
      // Delete all page files
      for (const pageInfo of summary.pages) {
        const pagePath = path.join(transactionsDir, `${address}-transactions-page-${pageInfo.pageNumber}.json`);
        if (await fs.pathExists(pagePath)) {
          await fs.remove(pagePath);
        }
      }
      
      // Delete summary file
      await fs.remove(summaryPath);
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing transaction data:', error);
    return false;
  }
}

/**
 * Lists all addresses that have transaction data
 */
export async function listStoredAddresses(
  basePath: string
): Promise<string[]> {
  try {
    const transactionsDir = path.join(basePath, 'transactions');
    
    // Ensure directory exists
    if (!(await fs.pathExists(transactionsDir))) {
      return [];
    }
    
    // Read all files in directory
    const files = await fs.readdir(transactionsDir);
    
    // Filter for summary files
    const summaryFiles = files.filter(file => file.endsWith('-summary.json'));
    
    // Extract addresses
    return summaryFiles.map(file => file.replace('-summary.json', ''));
  } catch (error) {
    console.error('Error listing stored addresses:', error);
    return [];
  }
}
