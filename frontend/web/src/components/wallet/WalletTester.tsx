"use client";
import { useState } from "react";
import * as apiService from "@/lib/api/api-service";
import JsonViewer from "../analytics/JsonViewer";

export default function WalletTester() {
  const [walletAddress, setWalletAddress] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [txSignature, setTxSignature] = useState("");
  const [compareTokens, setCompareTokens] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);
  const [useRealApi, setUseRealApi] = useState(true);

  // Fonction pour générer des données fictives selon l'endpoint
  const generateMockData = (endpoint: string) => {
    console.log(`Generating mock data for endpoint: ${endpoint}`);

    // Portfolio endpoints
    if (
      endpoint.includes("/portfolio/") ||
      endpoint === "/api/portfolio/:walletAddress"
    ) {
      return {
        mock: true,
        sol: { amount: 10.5, usdValue: 1050.0 },
        tokens: [
          { symbol: "USDC", amount: 500, usdValue: 500 },
          { symbol: "JUP", amount: 100, usdValue: 150 },
        ],
      };
    }

    // Balance endpoint
    if (endpoint.includes("/balances/")) {
      return {
        mock: true,
        sol: { amount: 10.5, usdValue: 1050.0 },
        tokens: [
          { symbol: "USDC", amount: 500, usdValue: 500 },
          { symbol: "JUP", amount: 100, usdValue: 150 },
        ],
      };
    }

    // Assets endpoint
    if (endpoint.includes("/assets/")) {
      return {
        mock: true,
        assets: [
          { symbol: "SOL", amount: 10.5, usdValue: 1050.0 },
          { symbol: "USDC", amount: 500, usdValue: 500 },
          { symbol: "JUP", amount: 100, usdValue: 150 },
          { type: "NFT", name: "DeGod #1234", usdValue: 350 },
          { type: "NFT", name: "SMB #5678", usdValue: 220 },
        ],
      };
    }

    // Transaction history endpoint
    if (endpoint.includes("/history/")) {
      return {
        mock: true,
        transactions: Array.from({ length: 8 }, (_, i) => ({
          signature: `5xAt3ve1XcFxDGtCMDpLPRgXMvKvp6MWHWrwVK3mHpHjYx9timZsNFNrLdVCvyr1Kft${i}`,
          timestamp: Math.floor(Date.now() / 1000) - i * 86400 * 3, // Every 3 days
          type: i % 2 === 0 ? "Transfer" : "Swap",
          tokenTransfers: [
            {
              amount: (Math.random() * 2).toFixed(2),
              symbol: i % 3 === 0 ? "SOL" : i % 3 === 1 ? "USDC" : "JUP",
            },
          ],
        })),
      };
    }

    // Analysis endpoint
    if (endpoint.includes("/analysis/")) {
      return {
        mock: true,
        totalValue: 1700.0,
        changePercent: 5.2,
        breakdown: {
          sol: 62,
          stablecoins: 29,
          other: 9,
        },
      };
    }

    // Token transfers endpoint
    if (endpoint.includes("/token-transfers/")) {
      return {
        mock: true,
        transfers: Array.from({ length: 5 }, (_, i) => ({
          timestamp: Math.floor(Date.now() / 1000) - i * 86400 * 2,
          token: i % 2 === 0 ? "SOL" : "USDC",
          amount: (Math.random() * 10).toFixed(2),
          direction: i % 3 === 0 ? "in" : "out",
        })),
      };
    }

    // Token info endpoints
    if (endpoint.includes("/token/info/")) {
      return {
        mock: true,
        symbol: "MOCK",
        name: "Mock Token",
        decimals: 9,
        supply: "1000000000",
        holders: 12500,
        website: "https://example.com",
      };
    }

    if (endpoint.includes("/token/price/")) {
      return {
        mock: true,
        price: 1.45,
        change24h: 3.2,
        volume24h: 1250000,
      };
    }

    if (endpoint.includes("/token/price-history/")) {
      return {
        mock: true,
        prices: Array.from({ length: 30 }, (_, i) => ({
          timestamp: Math.floor(Date.now() / 1000) - i * 86400,
          price: 1.5 + Math.sin(i / 5) * 0.3,
        })),
      };
    }

    if (endpoint.includes("/token/market-data/")) {
      return {
        mock: true,
        marketCap: 145000000,
        fullyDilutedValuation: 200000000,
        rank: 123,
        volume24h: 12500000,
        ath: 4.2,
        athDate: "2023-12-01",
      };
    }

    if (endpoint.includes("/token/compare")) {
      return {
        mock: true,
        tokens: [
          { symbol: "TOKEN1", price: 1.23, change24h: 2.5 },
          { symbol: "TOKEN2", price: 0.45, change24h: -1.2 },
        ],
        comparison: {
          correlation: 0.65,
          priceRatio: 2.73,
        },
      };
    }

    if (endpoint.includes("/token/liquidity/")) {
      return {
        mock: true,
        totalLiquidity: 8500000,
        pools: [
          { dex: "Raydium", liquidity: 5000000, volume24h: 1200000 },
          { dex: "Orca", liquidity: 3500000, volume24h: 900000 },
        ],
      };
    }

    if (endpoint.includes("/token/trending")) {
      return {
        mock: true,
        trending: [
          { symbol: "SOL", price: 100.5, change24h: 5.2 },
          { symbol: "JUP", price: 1.25, change24h: 12.3 },
          { symbol: "BONK", price: 0.000015, change24h: 8.7 },
          { symbol: "RNDR", price: 7.8, change24h: -2.1 },
          { symbol: "PYTH", price: 0.45, change24h: 3.8 },
        ],
      };
    }

    // Transaction endpoint
    if (endpoint.includes("/transaction/")) {
      return {
        mock: true,
        signature: txSignature,
        timestamp: Math.floor(Date.now() / 1000) - 86400,
        status: "confirmed",
        fee: 0.000005,
        type: "Transfer",
        tokenTransfers: [{ amount: 1.25, symbol: "SOL", usdValue: 125 }],
      };
    }

    // Fallback générique
    return {
      mock: true,
      message: "Demo data for " + endpoint,
    };
  };

  // Fonction générique pour appeler une API et afficher les résultats
  const callApi = async (apiFunction: () => Promise<any>, endpoint: string) => {
    setLoading(true);
    setActiveEndpoint(endpoint);
    setError(null);

    try {
      if (!useRealApi) {
        // Mode démo
        console.log("Using demo mode for endpoint:", endpoint);
        const mockData = generateMockData(endpoint);
        setResult(mockData);
      } else {
        // Vraie API
        console.log("Calling real API for endpoint:", endpoint);
        const data = await apiFunction();
        setResult(data);
      }
    } catch (err: any) {
      const isResponseError = err?.response?.status;
      const errorMessage = isResponseError
        ? `Error ${err.response.status}: ${err.response.statusText}`
        : err?.message || "An error occurred";

      console.error("API call error:", err);
      setError(errorMessage);
      setResult(null);
    } finally {
      setLoading(false);

      // Scroll to the results section
      setTimeout(() => {
        document
          .getElementById("results-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Valider l'adresse wallet (vérification simple)
  const isValidWalletAddress = () => {
    return walletAddress.length >= 32 && walletAddress.length <= 44;
  };

  // Valider l'adresse token (vérification simple)
  const isValidTokenAddress = () => {
    return tokenAddress.length >= 32 && tokenAddress.length <= 44;
  };

  // Valider la signature de transaction
  const isValidSignature = () => {
    return txSignature.length >= 32;
  };

  // Fonction pour effacer les résultats
  const clearResults = () => {
    setResult(null);
    setError(null);
    setActiveEndpoint(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl mb-24 font-poppins">
      {" "}
      {/* Add bottom margin to avoid footer overlap */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-purple-800">
          Wallet API Tester
        </h1>
        <div className="flex items-center">
          <span className="mr-2 text-sm">Use real API:</span>
          <button
            onClick={() => setUseRealApi(!useRealApi)}
            className={`px-3 py-1 rounded-full ${
              useRealApi
                ? "bg-green-500 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            {useRealApi ? "ON" : "OFF"}
          </button>
        </div>
      </div>
      {/* Wallet Address Input */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2 text-purple-700">
          Wallet Address
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter wallet address"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={() => {
              setWalletAddress("FuRS2oiXnGvwabV7JYjBU1VQCa6aida7LDybt91xy1YH");
            }}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
          >
            Use Example
          </button>
        </div>
        {walletAddress && !isValidWalletAddress() && (
          <p className="mt-2 text-red-500 text-sm">
            Wallet address should be between 32-44 characters
          </p>
        )}
      </div>
      {/* Portfolio Endpoints */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-purple-700">
          Portfolio Endpoints
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <button
            onClick={() =>
              callApi(
                () => apiService.getPortfolio(walletAddress),
                "/api/portfolio/:walletAddress"
              )
            }
            disabled={!isValidWalletAddress() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Get Portfolio
          </button>
          <button
            onClick={() =>
              callApi(
                () => apiService.getBalances(walletAddress),
                "/api/portfolio/balances/:walletAddress"
              )
            }
            disabled={!isValidWalletAddress() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Get Balances
          </button>
          <button
            onClick={() =>
              callApi(
                () => apiService.getAssets(walletAddress),
                "/api/portfolio/assets/:walletAddress"
              )
            }
            disabled={!isValidWalletAddress() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Get Assets
          </button>
          <button
            onClick={() =>
              callApi(
                () => apiService.getTransactionHistory(walletAddress),
                "/api/portfolio/history/:walletAddress"
              )
            }
            disabled={!isValidWalletAddress() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Get Transaction History
          </button>
          <button
            onClick={() =>
              callApi(
                () => apiService.getPortfolioAnalysis(walletAddress),
                "/api/portfolio/analysis/:walletAddress"
              )
            }
            disabled={!isValidWalletAddress() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Get Portfolio Analysis
          </button>
          <button
            onClick={() =>
              callApi(
                () => apiService.getTokenTransfers(walletAddress),
                "/api/portfolio/token-transfers/:walletAddress"
              )
            }
            disabled={!isValidWalletAddress() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Get Token Transfers
          </button>
        </div>
      </div>
      {/* Token Endpoints */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-purple-700">
          Token Endpoints
        </h2>

        {/* Token Address Input */}
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2 text-purple-600">
            Token Address
          </h3>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Enter token address"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {tokenAddress && !isValidTokenAddress() && (
            <p className="mt-1 text-red-500 text-sm">
              Token address should be between 32-44 characters
            </p>
          )}
        </div>

        {/* Token Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
          <button
            onClick={() =>
              callApi(
                () => apiService.getToken(tokenAddress),
                "/api/token/:tokenAddress"
              )
            }
            disabled={!isValidTokenAddress() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Get Token
          </button>
          <button
            onClick={() =>
              callApi(
                () => apiService.getTokenInfo(tokenAddress),
                "/api/token/info/:tokenAddress"
              )
            }
            disabled={!isValidTokenAddress() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Get Token Info
          </button>
          <button
            onClick={() =>
              callApi(
                () => apiService.getTokenPrice(tokenAddress),
                "/api/token/price/:tokenAddress"
              )
            }
            disabled={!isValidTokenAddress() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Get Token Price
          </button>
          <button
            onClick={() =>
              callApi(
                () => apiService.getTokenPriceHistory(tokenAddress),
                "/api/token/price-history/:tokenAddress"
              )
            }
            disabled={!isValidTokenAddress() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Get Token Price History
          </button>
          <button
            onClick={() =>
              callApi(
                () => apiService.getTokenLiquidity(tokenAddress),
                "/api/token/liquidity/:tokenAddress"
              )
            }
            disabled={!isValidTokenAddress() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Get Token Liquidity
          </button>
        </div>

        {/* Symbol Input */}
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2 text-purple-600">
            Token Symbol
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              placeholder="Enter token symbol (e.g. SOL)"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() =>
                callApi(
                  () => apiService.getTokenMarketData(tokenSymbol),
                  "/api/token/market-data/:symbol"
                )
              }
              disabled={!tokenSymbol || loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Get Market Data
            </button>
          </div>
        </div>

        {/* Compare Tokens */}
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2 text-purple-600">
            Compare Tokens
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={compareTokens}
              onChange={(e) => setCompareTokens(e.target.value)}
              placeholder="Enter token addresses, comma separated"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() =>
                callApi(
                  () => apiService.compareTokens(compareTokens.split(",")),
                  "/api/token/compare"
                )
              }
              disabled={!compareTokens || loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Compare Tokens
            </button>
          </div>
        </div>

        {/* Trending Tokens */}
        <button
          onClick={() =>
            callApi(() => apiService.getTrendingTokens(), "/api/token/trending")
          }
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Get Trending Tokens
        </button>
      </div>
      {/* Transaction Endpoint */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-purple-700">
          Transaction Endpoint
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={txSignature}
            onChange={(e) => setTxSignature(e.target.value)}
            placeholder="Enter transaction signature"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={() =>
              callApi(
                () => apiService.getTransaction(txSignature),
                "/api/transaction/:signature"
              )
            }
            disabled={!isValidSignature() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Get Transaction
          </button>
        </div>
        {txSignature && !isValidSignature() && (
          <p className="mt-2 text-red-500 text-sm">
            Transaction signature should be at least 32 characters
          </p>
        )}
      </div>
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-purple-700">
          Tests de Portfolio Avancés
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <button
            onClick={() =>
              callApi(
                () => apiService.getRecentTransactions(walletAddress, 10),
                "/api/portfolio/transactions/recent"
              )
            }
            disabled={!isValidWalletAddress() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Tester Dernières Transactions
          </button>

          <button
            onClick={() => {
              // Simulation d'un appel API pour les NFTs
              const mockData = {
                message: "Show my NFTs",
                walletAddress: walletAddress,
              };
              callApi(
                () =>
                  fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(mockData),
                  }).then((res) => res.json()),
                "/api/chat [NFT request]"
              );
            }}
            disabled={!isValidWalletAddress() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Tester Affichage NFTs
          </button>

          <button
            onClick={() => {
              // Simulation d'un appel API pour DeFi
              const mockData = {
                message: "Show my DeFi activity",
                walletAddress: walletAddress,
              };
              callApi(
                () =>
                  fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(mockData),
                  }).then((res) => res.json()),
                "/api/chat [DeFi request]"
              );
            }}
            disabled={!isValidWalletAddress() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Tester Activité DeFi
          </button>

          <button
            onClick={() => {
              // Simulation d'un appel API pour un token spécifique
              const mockData = {
                message: "Show my SOL transactions",
                walletAddress: walletAddress,
              };
              callApi(
                () =>
                  fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(mockData),
                  }).then((res) => res.json()),
                "/api/chat [Token request]"
              );
            }}
            disabled={!isValidWalletAddress() || loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Tester Transactions SOL
          </button>
        </div>
      </div>
      {/* Results Section */}
      <div id="results-section" className="p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-purple-700">Results</h2>
          <div className="flex gap-2 flex-wrap">
            {activeEndpoint && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full max-w-full break-all">
                {`https://rpc1-taupe.vercel.app${activeEndpoint
                  .replace(":walletAddress", walletAddress)
                  .replace(":tokenAddress", tokenAddress)
                  .replace(":signature", txSignature)
                  .replace(":symbol", tokenSymbol)}`}
              </span>
            )}
            {(result || error) && (
              <button
                onClick={clearResults}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full hover:bg-gray-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {!loading && error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            <p className="font-medium">Error:</p>
            <pre className="whitespace-pre-wrap break-words text-sm mt-1">
              {error}
            </pre>
          </div>
        )}

        {!loading && result && (
          <div className="overflow-auto" style={{ maxHeight: "500px" }}>
            <JsonViewer data={result} expandedDepth={2} />
          </div>
        )}

        {!loading && !error && !result && (
          <div className="p-8 text-center text-gray-500">
            <p>Select an endpoint to see results here</p>
          </div>
        )}
      </div>
    </div>
  );
}
