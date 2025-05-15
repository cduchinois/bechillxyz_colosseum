"use client";

import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PricePoint {
  date: string; // format ISO
  price_usd: number;
}

interface AssetGrowthChartProps {
  symbol: string;
  historicalPrices: PricePoint[];
  selectedTimeFrame: string; // ← utilisé pour filtrer
}

const AssetGrowthChart: React.FC<AssetGrowthChartProps> = ({
  symbol,
  historicalPrices,
  selectedTimeFrame,
}) => {
  // ✅ Filtrage intelligent selon le timeFrame
  const filteredData = useMemo(() => {
    if (!historicalPrices?.length) return [];

    const now = new Date();
    let cutoff = new Date(now);

    switch (selectedTimeFrame) {
      case "1J":
        cutoff.setDate(now.getDate() - 1);
        break;
      case "7J":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "1M":
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case "1A":
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      case "ALL":
      default:
        return historicalPrices;
    }

    return historicalPrices.filter((p) => new Date(p.date) >= cutoff);
  }, [historicalPrices, selectedTimeFrame]);

  const labels = filteredData.map((p) =>
    new Date(p.date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    })
  );

  const dataPoints = filteredData.map((p) => p.price_usd);

  const chartData = {
    labels,
    datasets: [
      {
        label: `${symbol} Price (USD)`,
        data: dataPoints,
        fill: true,
        backgroundColor: "rgba(112, 54, 205, 0.1)",
        borderColor: "#7036cd",
        tension: 0.4,
        pointRadius: 2,
        pointBackgroundColor: "#7036cd",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: function (ctx: any) {
            return `$${ctx.raw?.toFixed(4)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: {
          callback: function (value: any) {
            return `$${value}`;
          },
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      {filteredData.length === 0 ? (
        <p className="text-gray-400">No price data available</p>
      ) : (
        <Line data={chartData} options={options} />
      )}
    </div>
  );
};

export default AssetGrowthChart;
