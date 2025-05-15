"use client";

import React from "react";
import { ArrowUp } from "lucide-react";
import AssetDistributionChart from "@/components/dashboard/AssetDistributionChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getAssetColor } from "@/utils/Formatter";
import AssetGrowthChart from "@/components/dashboard/AssetGrowthChart";

interface PricePoint {
  date: string;
  price_usd: number;
}

interface Asset {
  symbol: string;
  name: string;
  amount: number;
  valueEUR: number;
  unitPrice: number;
}

interface AssetsTabProps {
  isLoading: boolean;
  refreshData: () => void;
  lastUpdated: Date | null;
  totalValue: number;
  solBalance: number;
  selectedTimeFrame: string;
  setSelectedTimeFrame: (frame: string) => void;
  cryptoAssets: Asset[];
  solPriceHistory: PricePoint[];
}

const AssetsTab: React.FC<AssetsTabProps> = ({
  isLoading,
  refreshData,
  lastUpdated,
  totalValue,
  solBalance,
  selectedTimeFrame,
  setSelectedTimeFrame,
  cryptoAssets,
  solPriceHistory,
}) => {
  return (
    <div className="space-y-6">
      {/* Net Worth + Allocation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Net Worth */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-bold text-gray-500 mb-2">Total Net Worth</h2>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="text-4xl font-bold text-[#7036cd] mb-2">
                €{totalValue.toFixed(2)}
              </div>
              <div className="flex items-center space-x-2 text-green-500">
                <ArrowUp size={16} />
                <span>+{(totalValue * 0.082).toFixed(2)}€</span>
                <span className="text-sm">+8.2%</span>
              </div>
              <div className="text-gray-400 text-sm mt-1">
                {lastUpdated?.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-600">
                    Solana: {solBalance.toFixed(4)} SOL
                  </span>
                  <span className="text-xs text-gray-400">
                    Dernière mise à jour:{" "}
                    {isLoading ? "..." : lastUpdated?.toLocaleTimeString() || "-"}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {["1J", "7J", "1M", "1A", "ALL"].map((frame) => (
                    <button
                      key={frame}
                      onClick={() => setSelectedTimeFrame(frame)}
                      className={`text-xs px-2 py-1 rounded ${
                        selectedTimeFrame === frame
                          ? "bg-[#7036cd] text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      }`}
                    >
                      {frame}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Allocation */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-bold text-gray-500 mb-4">Allocation</h2>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="flex-1 relative">
                <AssetDistributionChart
                  assets={cryptoAssets}
                  totalValue={totalValue}
                />
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-2xl font-bold text-[#7036cd]">
                    €{totalValue.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {cryptoAssets.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getAssetColor(asset.symbol)} mr-2`} />
                      <span className="text-sm">{asset.name}</span>
                    </div>
                    <span className="text-sm">
                      {totalValue > 0
                        ? ((asset.valueEUR / totalValue) * 100).toFixed(2)
                        : "0.00"}
                      %
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Historical price */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-lg font-bold text-gray-500 mb-4">
          SOL Price History
        </h2>
        {isLoading ? (
          <LoadingSpinner />
        ) : solPriceHistory.length > 0 ? (
          <AssetGrowthChart
            symbol="SOL"
            historicalPrices={solPriceHistory}
            selectedTimeFrame={selectedTimeFrame}
          />
        ) : (
          <p className="text-gray-400">No data</p>
        )}
      </div>
    </div>
  );
};

export default AssetsTab;
