// src/lib/wallet-api.ts
const API_BASE_URL = 'https://rpc1-taupe.vercel.app';

export async function getLastTransaction(walletAddress: string): Promise<any> {
  try {
    // Récupérer l'historique des transactions (limité à 1)
    const response = await fetch(`${API_BASE_URL}/api/portfolio/history/${walletAddress}?limit=1`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching wallet transaction:", error);
    throw error;
  }
}

export async function getRecentTransactions(walletAddress: string, days: number = 30): Promise<any> {
  try {
    // Get transaction history for the specified number of days
    // If your API supports a days parameter, use it, otherwise we'll get all and filter
    const response = await fetch(`${API_BASE_URL}/api/portfolio/history/${walletAddress}?limit=30`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // If we need to filter by date on the client side
    if (data && data.transactions) {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const daysInSeconds = days * 24 * 60 * 60;
      const cutoffTime = nowInSeconds - daysInSeconds;
      
      // Filter transactions that are within the specified days
      data.transactions = data.transactions.filter(
        (tx: any) => tx.timestamp && tx.timestamp >= cutoffTime
      );
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    throw error;
  }
}

export async function getWalletBalance(walletAddress: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/portfolio/balances/${walletAddress}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    throw error;
  }
}

export async function getWalletAnalysis(walletAddress: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/portfolio/analysis/${walletAddress}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching wallet analysis:", error);
    throw error;
  }
}