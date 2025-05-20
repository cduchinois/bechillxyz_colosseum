import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs-extra';
import { PublicKey } from '@solana/web3.js';
import axios from 'axios';

// Define the transaction interfaces
interface EarliestTransaction {
  blockTime: number;
  confirmationStatus: string;
  err: any | null;
  memo: string | null;
  signature: string;
  slot: number;
}

interface TransactionPageInfo {
  pageNumber: number;
  filename: string;
  transactionCount: number;
  lastSignature: string;
  lastBlockTime: number;
  lastBlockTimeFormatted: string;
  timestamp: number;
}

interface TransactionSummary {
  address: string;
  lastUpdated: string;
  lastFetched: string;
  totalPages: number;
  totalTransactions: number;
  walletCreationDate: string;
  earliestTransaction: EarliestTransaction;
  pages: TransactionPageInfo[];
  allFetched?: boolean;
}

// Include necessary functions from our library directly to avoid import issues
// These are simplified versions of the functions from our library
const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

async function fetchTransactions(rpcUrl: string, address: string, limit: number = 100, before?: string) {
  try {
    const params: any = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignaturesForAddress',
      params: [
        address,
        { limit }
      ]
    };
    
    if (before) {
      params.params[1].before = before;
    }
    
    const response = await axios.post(rpcUrl, params);
    if (response.data.error) {
      throw new Error(`RPC Error: ${JSON.stringify(response.data.error)}`);
    }
    
    return response.data.result || [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

async function getTransactionSummary(basePath: string, address: string) {
  try {
    const summaryPath = path.join(basePath, 'transactions', `${address}-summary.json`);
    if (await fs.pathExists(summaryPath)) {
      const summary = await fs.readJson(summaryPath);
      
      // Make sure allFetched is defined
      if (summary.allFetched === undefined) {
        summary.allFetched = false;
        
        // Check if we should mark it as allFetched based on last page transaction count
        if (summary.pages && summary.pages.length > 0) {
          const lastPage = summary.pages[summary.pages.length - 1];
          if (lastPage.transactionCount < 100) {
            summary.allFetched = true;
            // Write back the updated summary
            await fs.writeJson(summaryPath, summary, { spaces: 2 });
            console.log(`Updated existing summary for ${address} with allFetched=true`);
          }
        }
      }
      
      return summary;
    }
    return null;
  } catch (error) {
    console.error('Error reading transaction summary:', error);
    throw error;
  }
}

async function fetchAllTransactions(rpcUrl: string, address: string, basePath: string, maxPages: number = 10) {
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
    pages: [],
    allFetched: false
  };

  try {
    while (hasMore && currentPage <= maxPages) {
      const transactions = await fetchTransactions(rpcUrl, address, 100, lastSignature);
      
      if (transactions.length === 0) {
        hasMore = false;
        break;
      }

      // Save transactions to file
      const dirPath = path.join(basePath, 'transactions');
      await fs.ensureDir(dirPath);
      const filePath = path.join(dirPath, `${address}-transactions-page-${currentPage}.json`);
      await fs.writeJson(filePath, transactions, { spaces: 2 });

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

      // Update summary
      if (transactions.length > 0) {
        // First transaction in array is the newest (most recent)
        const firstTx = transactions[0];
        // Last transaction in array is the oldest
        const lastTx = transactions[transactions.length - 1];
        
        // Get current timestamp
        const now = new Date();
        const isoNow = now.toISOString();
        const timestamp = now.getTime();
        
        // Update the summary with the latest fetch info
        summary.lastUpdated = isoNow;
        summary.lastFetched = isoNow;
        
        // Update total transaction count
        summary.totalTransactions += transactions.length;
        
        // Add page info
        const pageInfo: TransactionPageInfo = {
          pageNumber: currentPage,
          filename: `${address}-transactions-page-${currentPage}.json`,
          transactionCount: transactions.length,
          lastSignature: lastTx.signature,
          lastBlockTime: lastTx.blockTime,
          lastBlockTimeFormatted: formatDate(lastTx.blockTime),
          timestamp: timestamp
        };
        
        // Update or add page info
        const existingPageIndex = summary.pages.findIndex(p => p.pageNumber === currentPage);
        if (existingPageIndex !== -1) {
          summary.pages[existingPageIndex] = pageInfo;
        } else {
          summary.pages.push(pageInfo);
        }
        
        // Sort pages by page number
        summary.pages.sort((a, b) => a.pageNumber - b.pageNumber);
        
        // Update totalPages
        summary.totalPages = summary.pages.length;
        
        // Check if this is the oldest transaction we've seen
        // Update earliestTransaction and walletCreationDate if needed
        if (!summary.earliestTransaction || 
            lastTx.blockTime < (summary.earliestTransaction?.blockTime || Infinity)) {
          
          summary.earliestTransaction = {
            blockTime: lastTx.blockTime,
            confirmationStatus: lastTx.confirmationStatus || 'finalized',
            err: lastTx.err,
            memo: lastTx.memo,
            signature: lastTx.signature,
            slot: lastTx.slot
          };
          
          summary.walletCreationDate = formatDate(lastTx.blockTime);
        }
      }

      lastSignature = transactions[transactions.length - 1]?.signature;
      currentPage++;

      if (transactions.length < 100) {
        hasMore = false;
        // If we got less than 100 transactions, we've reached the end
        summary.allFetched = true;
      }
    }

    // Save summary file
    const summaryPath = path.join(basePath, 'transactions', `${address}-summary.json`);
    await fs.writeJson(summaryPath, summary, { spaces: 2 });

    return summary;
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address || Array.isArray(address)) {
    return res.status(400).json({ error: 'Valid address is required' });
  }

  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({ error: 'Invalid Solana address' });
  }

  try {
    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    
    if (!HELIUS_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    // Use the correct Helius RPC URL format for mainnet
    const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    const publicDir = path.join(process.cwd(), 'public');
    
    // Ensure transactions directory exists
    const transactionsDir = path.join(publicDir, 'transactions');
    await fs.ensureDir(transactionsDir);
    
    // First check if we already have a summary for this address
    let summary = await getTransactionSummary(publicDir, address);
    
    const maxPages = req.query.maxPages ? parseInt(req.query.maxPages as string) : 5;
    
    // If we don't have a summary, fetch transactions
    if (!summary) {
      summary = await fetchAllTransactions(rpcUrl, address, publicDir, maxPages);
    } 
    // If refresh is requested 
    else if (req.query.refresh === 'true') {
      // Initialize allFetched to false if it's not already defined
      if (summary.allFetched === undefined) {
        summary.allFetched = false;
      }
      if (summary.earliestTransaction && summary.earliestTransaction.signature) {
        // Start with existing pages and current max page number
        let currentPage = summary.totalPages > 0 ? summary.totalPages : 0;
        let lastSignature = summary.earliestTransaction.signature;
        let additionalPages = 0;
        let hasMore = true;
        
        // Continue fetching from the earliest known transaction
        while (hasMore && additionalPages < maxPages) {
          currentPage++;
          additionalPages++;
          
          const transactions = await fetchTransactions(rpcUrl, address, 100, lastSignature);
          
          if (transactions.length === 0) {
            hasMore = false;
            break;
          }

          // Save transactions to file
          const dirPath = path.join(publicDir, 'transactions');
          const filePath = path.join(dirPath, `${address}-transactions-page-${currentPage}.json`);
          await fs.writeJson(filePath, transactions, { spaces: 2 });
          
          // Format date for summary
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
          
          if (transactions.length > 0) {
            const lastTx = transactions[transactions.length - 1];
            const now = new Date();
            const timestamp = now.getTime();
            
            // Update summary
            summary.lastUpdated = now.toISOString();
            summary.lastFetched = now.toISOString();
            summary.totalTransactions += transactions.length;
            
            // Add new page info
            const pageInfo: TransactionPageInfo = {
              pageNumber: currentPage,
              filename: `${address}-transactions-page-${currentPage}.json`,
              transactionCount: transactions.length,
              lastSignature: lastTx.signature,
              lastBlockTime: lastTx.blockTime,
              lastBlockTimeFormatted: formatDate(lastTx.blockTime),
              timestamp: timestamp
            };
            
            summary.pages.push(pageInfo);
            
            // Update totalPages
            summary.totalPages = summary.pages.length;
            
            // Check if this is the oldest transaction we've seen
            if (lastTx.blockTime < summary.earliestTransaction.blockTime) {
              summary.earliestTransaction = {
                blockTime: lastTx.blockTime,
                confirmationStatus: lastTx.confirmationStatus || 'finalized',
                err: lastTx.err,
                memo: lastTx.memo,
                signature: lastTx.signature,
                slot: lastTx.slot
              };
              
              summary.walletCreationDate = formatDate(lastTx.blockTime);
            }
            
            // Update last signature for next iteration
            lastSignature = lastTx.signature;
            
            if (transactions.length < 100) {
              hasMore = false;
              // If we got less than 100 transactions, we've reached the end
              summary.allFetched = true;
            }
          } else {
            hasMore = false;
          }
        }
        
        // Save updated summary file
        const summaryPath = path.join(publicDir, 'transactions', `${address}-summary.json`);
        await fs.writeJson(summaryPath, summary, { spaces: 2 });
      } else {
        // No earliest transaction found, fetch from beginning
        summary = await fetchAllTransactions(rpcUrl, address, publicDir, maxPages);
      }
    }
    
    // Make sure allFetched flag is set correctly before returning
    if (summary && summary.allFetched === undefined) {
      if (summary.pages && summary.pages.length > 0) {
        const lastPage = summary.pages[summary.pages.length - 1];
        summary.allFetched = lastPage.transactionCount < 100;
        console.log(`Setting allFetched=${summary.allFetched} for ${address} before returning`);
      } else {
        summary.allFetched = false;
      }
      
      // Save the updated summary
      const summaryPath = path.join(publicDir, 'transactions', `${address}-summary.json`);
      await fs.writeJson(summaryPath, summary, { spaces: 2 });
    }
    
    console.log(`Returning summary for ${address} with allFetched=${summary?.allFetched}`);
    return res.status(200).json(summary);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch transactions' });
  }
}
