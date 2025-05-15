// src/services/heliusService.ts
import axios from "axios";

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY || "";
const HELIUS_API_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export const getSolBalance = async (address: string): Promise<number> => {
  try {
    const response = await fetch(HELIUS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
    });

    const json = await response.json();
    return json.result?.value / 10 ** 9 || 0;
  } catch (err) {
    console.error("❌ Erreur getSolBalance:", err);
    return 0;
  }
};

const TOKEN_MINT_TO_SYMBOL: Record<string, string> = {
  So11111111111111111111111111111111111111112: "SOL",
  JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB: "JUP",
  DezXfFz9NfUwU4QeEjGFk94QpKkpYzxhpT2RSyBPa9CH: "BONK",
};

export const refreshWalletData = async (address: string) => {
  try {
    const balanceResponse = await axios.post(HELIUS_API_URL, {
      jsonrpc: "2.0",
      id: "balance",
      method: "getBalance",
      params: [address],
    });

    const solBalance = balanceResponse.data?.result?.value / 10 ** 9 || 0;

    const parsedTokens = await getParsedTokenBalances(address);

    if (!parsedTokens.length) {
      console.warn("[HELIUS] Aucun token détecté dans ce wallet.");
    }

    return {
      success: true,
      solBalance,
      walletData: {},
      txHistory: [],
      formattedAssets: parsedTokens.map((token) => ({
        symbol: token.symbol,
        amount: token.amount,
      })),
    };
  } catch (error) {
    console.error("[HELIUS] refreshWalletData failed:", error);
    return {
      success: false,
      solBalance: 0,
      walletData: {},
      txHistory: [],
      formattedAssets: [],
    };
  }
};

export const getParsedTokenBalances = async (
  walletAddress: string
): Promise<{ symbol: string; amount: number }[]> => {
  try {
    const response = await axios.post(HELIUS_API_URL, {
      jsonrpc: "2.0",
      id: "tokenBalances",
      method: "getTokenAccountsByOwner",
      params: [
        walletAddress,
        { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { encoding: "jsonParsed" },
      ],
    });

    const accounts = response.data?.result?.value || [];

    if (!accounts.length) {
      console.warn("[HELIUS] Aucun token trouvé pour ce wallet.");
    }

    const tokens: { symbol: string; amount: number }[] = accounts
      .map((acc: any) => {
        const info = acc.account.data.parsed.info;
        const rawAmount = info.tokenAmount.uiAmount;
        const mint = info.mint;
        const symbol = TOKEN_MINT_TO_SYMBOL[mint] || mint;

        return {
          symbol,
          amount: rawAmount,
        };
      })
      .filter((t: { symbol: string; amount: number }) => t.amount > 0);

    return tokens;
  } catch (error) {
    console.error("[HELIUS] Échec récupération des tokens:", error);
    return [];
  }
};

export const testWalletAddress = async (address: string) => {
  try {
    const solBalance = await getSolBalance(address);
    const tokens = await getParsedTokenBalances(address);
    console.log("📦 Tokens retournés par Helius:", tokens);

    return {
      success: true,
      solBalance,
      formattedAssets: tokens, // important !
    };
  } catch (error) {
    console.error("Test échoué", error);
    return {
      success: false,
      solBalance: 0,
      formattedAssets: [],
    };
  }
};

export const fetchWalletData = refreshWalletData;

export const fetchSolBalance = async (address: string): Promise<number> => {
  try {
    const res = await axios.post(HELIUS_API_URL, {
      jsonrpc: "2.0",
      id: "balance",
      method: "getBalance",
      params: [address],
    });

    const value = res.data?.result?.value || 0;
    return value / 10 ** 9;
  } catch (err) {
    console.error("Erreur balance SOL:", err);
    return 0;
  }
};

export const fetchTransactionHistory = async (
  walletAddress: string,
  limit: number = 20
) => {
  // Intègre `limit` dans l'appel si nécessaire, ex :
  const response = await axios.post(HELIUS_API_URL, {
    jsonrpc: "2.0",
    id: "getSignatures",
    method: "getSignaturesForAddress",
    params: [walletAddress, { limit }],
  });

  return response.data.result;
};

export const formatAssetsForDashboard = async (
  items: any[],
  solBalance: number
) => {
  // Exemple très simplifié
  return [
    {
      symbol: "SOL",
      amount: solBalance,
    },
    ...items.map((item) => ({
      symbol: item.symbol,
      amount: item.amount,
    })),
  ];
};
