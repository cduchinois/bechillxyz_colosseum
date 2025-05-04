import { NextRequest, NextResponse } from 'next/server';
import { getLastTransaction, getRecentTransactions, getWalletBalance, getWalletAnalysis } from '@/lib/wallet-api';

export async function POST(request: NextRequest) {
  try {
    const { message, walletAddress } = await request.json();
    
    if (!walletAddress) {
      return NextResponse.json({ 
        response: "To continue, I need a Solana wallet address.",
        requireWallet: true
      });
    }

    // Detect different types of requests
    const messageLC = message.toLowerCase();
    
    try {
      // Check request type
      if (messageLC.includes('last transaction') || messageLC.includes('recent transaction') || messageLC.includes('transactions')) {
        // Modified to get transactions for the last 30 days
        const data = await getRecentTransactions(walletAddress, 30);
        return NextResponse.json({ 
          response: "Here are your transactions from the last 30 days:", 
          data,
          type: "wallet-transaction" 
        });
      } 
      else if (messageLC.includes('balance') || messageLC.includes('holdings')) {
        const data = await getWalletBalance(walletAddress);
        return NextResponse.json({ 
          response: `Your balance: ${data.sol?.amount || 0} SOL (${data.sol?.usdValue || 0} USD)`,
          data
        });
      }
      else if (messageLC.includes('analysis') || messageLC.includes('performance')) {
        const data = await getWalletAnalysis(walletAddress);
        return NextResponse.json({ 
          response: `Portfolio analysis: ${data.totalValue || 0} USD, change: ${data.changePercent || 0}%`, 
          data
        });
      }
      else {
        return NextResponse.json({ 
          response: "I don't understand your wallet query. Try asking about your transactions, balance, or portfolio analysis." 
        });
      }
    } catch (apiError) {
      console.error('API data error:', apiError);
      // Simulate response for testing
      if (messageLC.includes('last transaction') || messageLC.includes('recent transaction') || messageLC.includes('transactions')) {
        // Mock data for testing with multiple transactions over 30 days
        const mockData = {
          transactions: Array.from({ length: 8 }, (_, i) => ({
            signature: `5xAt3ve1XcFxDGtCMDpLPRgXMvKvp6MWHWrwVK3mHpHjYx9timZsNFNrLdVCvyr1Kft${i}`,
            timestamp: Math.floor(Date.now() / 1000) - (i * 86400 * 3), // Every 3 days
            type: i % 2 === 0 ? "Transfer" : "Swap",
            tokenTransfers: [
              {
                amount: (Math.random() * 2).toFixed(2),
                symbol: i % 3 === 0 ? "SOL" : (i % 3 === 1 ? "USDC" : "JUP")
              }
            ]
          }))
        };
        
        return NextResponse.json({ 
          response: "Here are your transactions from the last 30 days (demo mode):", 
          data: mockData,
          type: "wallet-transaction",
          demo: true
        });
      } else {
        return NextResponse.json({ 
          response: "I couldn't retrieve data for this wallet. Please verify the address and try again." 
        });
      }
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      response: "Sorry, an error occurred while analyzing your wallet." 
    }, { status: 500 });
  }
}