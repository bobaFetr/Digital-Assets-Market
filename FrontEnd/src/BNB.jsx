import React, { useCallback, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale,
  PointElement, Title, Tooltip,
} from "chart.js";
import { request } from "./Services/Service";
import "./App.css";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

export default function BNBChart() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const rows = await request("/api/market/klines?symbol=BNBUSD&interval=1m&limit=60");
      const candles = Array.isArray(rows) ? rows : [];
      setChartData({
        labels: candles.map(item => new Date(item.closeTimeUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })),
        datasets: [{
          label: "BNB price (USD)", data: candles.map(item => Number(item.close)),
          borderColor: "#357859", backgroundColor: "rgba(0, 255, 204, 0.1)",
          tension: 0.3, fill: true, pointRadius: 2, pointBackgroundColor: "#00ffcc",
        }],
      });
      setError("");
    } catch (loadError) {
      setError(loadError?.message || "Unable to load BNB market data.");
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 10000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const options = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: "Time" }, ticks: { color: "#94a3b8" }, grid: { color: "rgba(148, 163, 184, 0.18)" } },
      y: { title: { display: true, text: "BNB price (USD)" }, ticks: { color: "#94a3b8" }, grid: { color: "rgba(148, 163, 184, 0.18)" } },
    },
    plugins: {
      legend: { labels: { color: "#94a3b8" }, position: "top" },
      title: { display: true, text: "BNB price — last 60 minutes", color: "#94a3b8" },
    },
  };

  return <div className="container">
    {error ? <div className="ui-notice ui-notice--error">{error}</div> : <Line data={chartData} options={options} />}
  </div>;
}
