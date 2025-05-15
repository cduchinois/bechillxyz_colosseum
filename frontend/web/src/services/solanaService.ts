// src/services/solanaService.ts

// Type for Solana analysis results
interface SolanaAnalysisResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Cache to avoid redundant calls
const processedAddresses = new Map<string, any>();

/**
 * Centralized service for Solana API calls
 * This service ensures each address is only fetched once
 */
export class SolanaService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    this.baseUrl += "/api/solscan";
  }

  // Fetches only the tokens for a given address
  async getTokens(address: string): Promise<any> {
    // Check if the address is already cached
    if (processedAddresses.has(`tokens-${address}`)) {
      console.log(`Returning cached tokens for: ${address}`);
      return processedAddresses.get(`tokens-${address}`);
    }

    try {
      console.log(`Fetching tokens for: ${address}`);
      const response = await fetch(`${this.baseUrl}/tokens?address=${address}`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      // Store in cache
      processedAddresses.set(`tokens-${address}`, data);

      return data;
    } catch (error) {
      console.error("Error while fetching tokens:", error);
      throw error;
    }
  }

  // Method to analyze a Solana address
  async analyzeAddress(address: string): Promise<SolanaAnalysisResult> {
    // Validate the Solana address
    if (!address.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
      return {
        success: false,
        error: "Invalid Solana address format"
      };
    }

    try {
      // Fetch only the tokens
      const tokens = await this.getTokens(address);

      return {
        success: true,
        data: {
          address,
          tokens: tokens?.data || [],
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("Error analyzing address:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Method to format the results for the LLM
  formatTokensForLLM(result: SolanaAnalysisResult): string {
    if (!result.success || !result.data) {
      return `Error during analysis: ${result.error || "Data unavailable"}`;
    }

    const { tokens, address } = result.data;

    // Check if tokens are available
    if (!tokens || tokens.length === 0) {
      return `No tokens found for address ${address}.`;
    }

    // Format the token information
    let formattedText = `# Tokens found for address ${address}\n\n`;

    tokens.forEach((token: any, index: number) => {
      formattedText += `## Token ${index + 1}: ${token.symbol || 'Unknown'}\n`;
      formattedText += `- Name: ${token.name || 'Not specified'}\n`;
      formattedText += `- Amount: ${token.amount || '0'}\n`;

      if (token.usdValue) {
        formattedText += `- Estimated value: $${parseFloat(token.usdValue).toFixed(2)}\n`;
      }

      formattedText += '\n';
    });

    formattedText += "What else would you like to know about these tokens?";
    return formattedText;
  }
}

// Export a single instance
export const solanaService = new SolanaService();
export default solanaService;
