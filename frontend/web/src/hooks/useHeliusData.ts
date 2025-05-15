"use client";

import { useState, useEffect, useCallback } from "react";
import {
  refreshWalletData,
  fetchSolBalance,
  fetchTransactionHistory,
} from "@/services/heliusService";
import { loadTokenMap } from "@/lib/loadTokenMap";
import { getTokenNameFromMint } from "@/lib/tokenMap";

const useHeliusData = (walletAddress: string | null) => {
  const [assets, setAssets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [solBalance, setSolBalance] = useState(0);


  // ✅ Charger la token map au premier montage
  useEffect(() => {
    loadTokenMap();
  }, []);

  const formatTransactionsForDisplay = useCallback((txHistory: any[]) => {
    if (!Array.isArray(txHistory)) return [];
    return txHistory.map((tx) => {
      try {
        const date = new Date(tx.blockTime * 1000);
        return {
          date: date.toLocaleDateString("fr-FR", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          type: "Transfer",
          direction: "out",
          amount: "0.00 SOL",
          to: tx.transaction?.message?.accountKeys?.[0]?.pubkey || "Adresse inconnue",
          timestamp: date.getTime(),
        };
      } catch {
        return {
          date: new Date().toLocaleDateString("fr-FR"),
          type: "Unknown",
          direction: "out",
          amount: "? SOL",
          to: "Unknown",
          timestamp: Date.now(),
        };
      }
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, []);

  const formatAssetsForDashboard = (
    rawAssets: any[],
    solBalance: number
  ): { symbol: string; amount: number; name: string }[] => {
    return [
      {
        symbol: "So11111111111111111111111111111111111111112",
        amount: solBalance,
        name: "Solana",
      },
      ...rawAssets.map((item) => {
        const symbol = item.symbol || item.mint || "UNKNOWN";
        const name = getTokenNameFromMint(symbol) || symbol;


        return {
          symbol,
          amount: item.amount,
          name,
        };
      }),
    ];
  };

  const loadWalletData = useCallback(async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    setError(null);

    try {
      const solBalance = await fetchSolBalance(walletAddress);
      setSolBalance(solBalance); //
      const walletData = await refreshWalletData(walletAddress);

      const formattedAssets = formatAssetsForDashboard(
        walletData?.formattedAssets || [],
        solBalance
      );

      const enrichedAssets = await Promise.all(
        formattedAssets.map(async (asset) => {
          try {
            const res = await fetch(
              `/api/directus-historical?filterType=symbol&filterValue=${asset.symbol}&sort=-datetime`
            );
            const json = await res.json();
            const price = json.data?.[0]?.price_usd || 0;
            const valueEUR = asset.amount * price;

            return {
              ...asset,
              valueEUR,
              unitPrice: price,
            };
          } catch {
            return {
              ...asset,
              valueEUR: 0,
              unitPrice: 0,
            };
          }
        })
      );

      const total = enrichedAssets.reduce(
        (sum, asset) => sum + asset.valueEUR,
        0
      );

      setAssets(enrichedAssets);
      setTotalValue(total);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("💥 Erreur Helius Wallet Data:", err);
      setError("Erreur lors du chargement du wallet.");
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  const loadTransactionHistory = useCallback(async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    setError(null);
    try {
      const txHistory = await fetchTransactionHistory(walletAddress);
      const formatted = formatTransactionsForDisplay(txHistory);
      setTransactions(formatted);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("💥 Erreur Helius TX:", err);
      setError("Erreur lors du chargement des transactions.");
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, formatTransactionsForDisplay]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadWalletData(), loadTransactionHistory()]);
    } catch (err) {
      console.error("Erreur Helius refreshData:", err);
      setError("Erreur de chargement.");
    } finally {
      setIsLoading(false);
    }
  }, [loadWalletData, loadTransactionHistory]);

  useEffect(() => {
    if (walletAddress) refreshData();
  }, [walletAddress, refreshData]);

  return {
    assets,
    transactions,
    totalValue,
    solBalance,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    refreshWalletData: loadWalletData,
    refreshTransactionHistory: loadTransactionHistory,
  };
  
};

export default useHeliusData;
