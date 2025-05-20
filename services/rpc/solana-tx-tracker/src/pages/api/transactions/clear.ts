import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs-extra';
import { PublicKey } from '@solana/web3.js';

// Include necessary functions from our library directly
const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

async function clearTransactionData(basePath: string, address: string): Promise<boolean> {
  try {
    const transactionsDir = path.join(basePath, 'transactions');
    const summaryPath = path.join(transactionsDir, `${address}-summary.json`);
    
    // Check if summary exists
    if (await fs.pathExists(summaryPath)) {
      // Read summary to get all pages
      const summary = await fs.readJson(summaryPath);
      
      // Delete all page files
      for (const pageInfo of summary.pages) {
        const pagePath = path.join(transactionsDir, `${address}-transactions-page-${pageInfo.pageNumber || pageInfo.page}.json`);
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
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
    const publicDir = path.join(process.cwd(), 'public');
    const success = await clearTransactionData(publicDir, address);
    
    if (success) {
      return res.status(200).json({ message: 'Transaction data cleared successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to clear transaction data' });
    }
  } catch (error: any) {
    console.error('Error clearing transactions:', error);
    return res.status(500).json({ error: error.message || 'Failed to clear transaction data' });
  }
}
