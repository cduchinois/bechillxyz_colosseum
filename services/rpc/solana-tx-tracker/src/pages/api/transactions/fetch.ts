import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs-extra';
import { PublicKey } from '@solana/web3.js';
import axios from 'axios';

// Include necessary functions from our library directly
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

async function fetchAllTransactions(rpcUrl: string, address: string, basePath: string, maxPages: number = 10) {
  if (!isValidSolanaAddress(address)) {
    throw new Error('Invalid Solana address');
  }

  let currentPage = 1;
  let lastSignature: string | undefined = undefined;
  let hasMore = true;
  let summary = {
    address,
    firstTransactionDate: '',
    nb_all_transactions: 0,
    pages: []
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

      // Update summary
      if (transactions.length > 0) {
        const lastTx = transactions[transactions.length - 1];
        
        // Set first transaction date if not set or we're on page 1
        if (!summary.firstTransactionDate || currentPage === 1) {
          summary.firstTransactionDate = new Date(lastTx.blockTime * 1000).toISOString();
        }
        
        // Update total transaction count
        summary.nb_all_transactions += transactions.length;
        
        // Add page info
        const pageInfo = {
          page: currentPage,
          blocktime: lastTx.blockTime,
          lastSignature: lastTx.signature,
          nb_transaction: transactions.length
        };
        
        // Update or add page info
        const existingPageIndex = summary.pages.findIndex((p: any) => p.page === currentPage);
        if (existingPageIndex !== -1) {
          summary.pages[existingPageIndex] = pageInfo;
        } else {
          summary.pages.push(pageInfo);
        }
        
        // Sort pages by page number
        summary.pages.sort((a: any, b: any) => a.page - b.page);
      }

      lastSignature = transactions[transactions.length - 1]?.signature;
      currentPage++;

      if (transactions.length < 100) {
        hasMore = false;
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, maxPages } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
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
    
    const pages = maxPages ? parseInt(maxPages) : 5;
    const summary = await fetchAllTransactions(rpcUrl, address, publicDir, pages);
    
    return res.status(200).json(summary);
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch transactions' });
  }
}
