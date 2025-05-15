"use client";

import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Asset {
  name: string;           // ✅ on utilise name maintenant
  valueEUR: number;
}

interface AssetDistributionChartProps {
  assets: Asset[];
  totalValue: number;
}

const AssetDistributionChart: React.FC<AssetDistributionChartProps> = ({
  assets,
  totalValue,
}) => {
  const labels = assets.map((a) => a.name);
  const data = assets.map((a) =>
    totalValue > 0 ? (a.valueEUR / totalValue) * 100 : 0
  );

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          "#7036cd",
          "#facc15",
          "#4ade80",
          "#38bdf8",
          "#fb7185",
          "#f472b6",
          "#818cf8",
          "#a78bfa",
          "#34d399",
          "#fcd34d",
        ],
        borderColor: "white",
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `${ctx.label}: ${parseFloat(ctx.raw).toFixed(2)}%`,
        },
      },
    },
  };

  return (
    <div className="h-40">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default AssetDistributionChart;
