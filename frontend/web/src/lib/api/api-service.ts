// src/lib/api-service.ts
// Use the proxy configured in next.config.ts
const API_BASE_URL = '/wallet-api'; // This will be redirected to http://localhost:3001/api/

// Portfolio endpoints
export async function getPortfolio(walletAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/portfolio/${walletAddress}`);
}

export async function getBalances(walletAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/portfolio/balances/${walletAddress}`);
}

export async function getAssets(walletAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/portfolio/assets/${walletAddress}`);
}

export async function getTransactionHistory(walletAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/portfolio/history/${walletAddress}`);
}

export async function getPortfolioAnalysis(walletAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/portfolio/analysis/${walletAddress}`);
}

export async function getTokenTransfers(walletAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/portfolio/token-transfers/${walletAddress}`);
}

// Token endpoints
export async function getToken(tokenAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/token/${tokenAddress}`);
}

export async function getTokenInfo(tokenAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/token/info/${tokenAddress}`);
}

export async function getTokenPrice(tokenAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/token/price/${tokenAddress}`);
}

export async function getTokenPriceHistory(tokenAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/token/price-history/${tokenAddress}`);
}

export async function getTokenMarketData(symbol: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/token/market-data/${symbol}`);
}

export async function compareTokens(tokens: string[]): Promise<any> {
  const tokensParam = tokens.join(',');
  return fetchData(`${API_BASE_URL}/token/compare?tokens=${tokensParam}`);
}

export async function getTokenLiquidity(tokenAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/token/liquidity/${tokenAddress}`);
}

export async function getTrendingTokens(): Promise<any> {
  return fetchData(`${API_BASE_URL}/token/trending`);
}

// Transaction endpoint
export async function getTransaction(signature: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/transaction/${signature}`);
}

// For compatibility with wallet-api.ts
export async function getLastTransaction(walletAddress: string): Promise<any> {
  return fetchData(`${API_BASE_URL}/portfolio/history/${walletAddress}?limit=1`);
}

export async function getRecentTransactions(walletAddress: string, limit: number = 10): Promise<any> {
    // Remove the days parameter and just use a limit
    return fetchData(`${API_BASE_URL}/portfolio/history/${walletAddress}?limit=${limit}`, 10000); // 10 seconds timeout
  }

export async function getWalletBalance(walletAddress: string): Promise<any> {
  return getBalances(walletAddress);
}

export async function getWalletAnalysis(walletAddress: string): Promise<any> {
  return getPortfolioAnalysis(walletAddress);
}

// Enhanced fetch function with error handling and timeout
async function fetchData(url: string, timeout = 8000): Promise<any> {
    try {
      console.log(`[API Request] Starting request to: ${url} with timeout ${timeout}ms`);
      
      // Create a proper URL - ensure it starts with http:// or https://
      let fetchUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // If running in the browser, use the base URL of the current page
        if (typeof window !== 'undefined') {
          const baseUrl = window.location.origin;
          fetchUrl = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        } else {
          // If running on server, use the API_BASE_URL (or localhost)
          fetchUrl = `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
        }
      }
      
      console.log(`[API Request] Resolved URL: ${fetchUrl}`);
      
      // Create abort controller for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        cache: 'no-store'
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
    
    console.log(`[API Response] Status: ${response.status} for URL: ${url}`);
    
    // Get raw response text first
    const responseText = await response.text();
    console.log(`[API Response] Raw text length: ${responseText.length} characters`);
    
    if (!response.ok) {
      console.error(`[API Error] Status: ${response.status} for URL: ${url}`);
      console.error(`[API Error] Response body: ${responseText.substring(0, 500)}${responseText.length > 500 ? '...' : ''}`);
      throw new Error(`API error: ${response.status} - ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
    }
    
    // Parse JSON if possible
    let data;
    try {
      data = JSON.parse(responseText);
      console.log(`[API Success] Parsed JSON data for URL: ${url}`);
    } catch (parseError) {
      console.error("[API Error] Failed to parse JSON:", parseError);
      console.error(`[API Error] Raw response: ${responseText.substring(0, 500)}${responseText.length > 500 ? '...' : ''}`);
      throw new Error(`Error parsing API response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
    
    return data;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`[API Error] Request timeout after ${timeout}ms for URL: ${url}`);
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    console.error("[API Error] Fetch error:", error);
    throw error;
  }
}

// Nouvelle fonction à ajouter à api-service.ts

// Fonction pour récupérer des informations détaillées sur un token par son adresse
export async function getTokenMetadata(tokenMint: string) {
    try {
      console.log(`[API Service] Getting token metadata for: ${tokenMint}`);
      
      // Vous pouvez utiliser une API telle que celle fournie par Solana ou d'autres services
      const response = await fetch(`https://public-api.solscan.io/token/meta?tokenAddress=${tokenMint}`);
      
      if (!response.ok) {
        throw new Error(`Token metadata fetch failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[API Service] Error fetching token metadata:`, error);
      throw error;
    }
  }
  
  // Fonction pour enrichir les transactions avec des métadonnées de token
  export async function enrichTransactionsWithTokenMetadata(transactions: any[]) {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    console.log(`[API Service] Enriching ${transactions.length} transactions with token metadata`);
    
    // Collecter toutes les adresses de token uniques
    const tokenMints = new Set();
    transactions.forEach(tx => {
      if (tx.tokenTransfers && Array.isArray(tx.tokenTransfers)) {
        tx.tokenTransfers.forEach((transfer: any) => {
          if (transfer.tokenMint) {
            tokenMints.add(transfer.tokenMint);
          }
        });
      }
    });
    
    console.log(`[API Service] Found ${tokenMints.size} unique token mints`);
    
    // Récupérer les métadonnées pour chaque token (limiter à 10 requêtes en parallèle)
    const tokenMetadata: Record<string, any> = {};
    
    const tokenMintsArray = Array.from(tokenMints);
    const batchSize = 10;
    
    for (let i = 0; i < tokenMintsArray.length; i += batchSize) {
      const batch = tokenMintsArray.slice(i, i + batchSize);
      
      const metadataPromises = batch.map((mint: any) => 
        getTokenMetadata(mint)
          .then(data => ({ mint, data }))
          .catch(() => ({ mint, data: null })) // Éviter que les promesses échouent
      );
      
      const results = await Promise.all(metadataPromises);
      
      results.forEach(({ mint, data }) => {
        if (data) {
          tokenMetadata[mint] = data;
        }
      });
    }
    
    console.log(`[API Service] Fetched metadata for ${Object.keys(tokenMetadata).length} tokens`);
    
    // Enrichir les transactions avec les métadonnées
    const enrichedTransactions = transactions.map(tx => {
      if (tx.tokenTransfers && Array.isArray(tx.tokenTransfers)) {
        tx.tokenTransfers = tx.tokenTransfers.map((transfer: any) => {
          if (transfer.tokenMint && tokenMetadata[transfer.tokenMint]) {
            const metadata = tokenMetadata[transfer.tokenMint];
            
            return {
              ...transfer,
              symbol: transfer.symbol || metadata.symbol || "UNKNOWN",
              name: metadata.name || "",
              logo: metadata.icon || "",
              decimals: transfer.decimals || metadata.decimals || 9,
              tokenType: metadata.tokenType || transfer.tokenType,
              // Calculer la valeur USD si les prix sont disponibles
              usdValue: metadata.price && transfer.amount ? 
                (parseFloat(transfer.amount) * parseFloat(metadata.price)).toFixed(2) : 
                undefined
            };
          }
          return transfer;
        });
      }
      return tx;
    });
    
    return enrichedTransactions;
  }