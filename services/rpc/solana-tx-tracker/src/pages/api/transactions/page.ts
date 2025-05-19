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

async function getTransactionsPage(basePath: string, address: string, page: number) {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, page } = req.query;

  if (!address || Array.isArray(address)) {
    return res.status(400).json({ error: 'Valid address is required' });
  }

  if (!page || Array.isArray(page)) {
    return res.status(400).json({ error: 'Valid page number is required' });
  }

  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({ error: 'Invalid Solana address' });
  }

  try {
    const pageNumber = parseInt(page);
    
    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({ error: 'Invalid page number' });
    }
    
    const publicDir = path.join(process.cwd(), 'public');
    
    // Ensure transactions directory exists
    const transactionsDir = path.join(publicDir, 'transactions');
    await fs.ensureDir(transactionsDir);
    
    const transactions = await getTransactionsPage(publicDir, address, pageNumber);
    
    if (!transactions) {
      return res.status(404).json({ error: 'Transactions page not found' });
    }
    
    return res.status(200).json(transactions);
  } catch (error: any) {
    console.error('Error fetching transactions page:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch transactions' });
  }
}
