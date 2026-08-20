import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import Sidebar from "./Components/Sidebar";
import { getToken, request } from "./Services/Service";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function BCrypto({ assets = [] }) {
  const [log, setLog] = useState([]);
  const [marketAssets, setMarketAssets] = useState(assets);
  const [marketError, setMarketError] = useState("");
  const navigate = useNavigate();
  const isLightTheme = typeof document !== "undefined" && document.body.classList.contains("light-mode");
  const chartAxisColor = isLightTheme ? "#475569" : "#94a3b8";
  const chartGridColor = isLightTheme ? "rgba(148, 163, 184, 0.24)" : "rgba(148, 163, 184, 0.18)";

  useEffect(() => {
    let active = true;
    const loadMarket = async () => {
      try {
        const candles = await request("/api/market/klines?symbol=BTCUSD&interval=1m&limit=60");
        if (!active) return;
        setMarketAssets((Array.isArray(candles) ? candles : []).map(candle => ({
          symbol: candle.symbol,
          timestamp: candle.closeTimeUtc,
          price: Number(candle.close),
        })));
        setMarketError("");
      } catch (error) {
        if (!active) return;
        setMarketError(error?.message || "Unable to load market data.");
      }
    };
    loadMarket();
    const timer = setInterval(loadMarket, 10000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const openTrade = action => {
    if (!getToken()) {
      navigate("/sign-in", { state: { error: "Please sign in to use the trading demo." } });
      return;
    }

    const latest = marketAssets.at(-1);
    setLog(previous => [`Opening ${action} flow for ${latest?.symbol || "Crypto"}.`, ...previous]);
    navigate(`/buy-sell?action=${action}`);
  };

  const data = {
    labels: marketAssets.map(asset => asset.timestamp ? new Date(asset.timestamp).toLocaleTimeString() : ""),
    datasets: [{
      label: "Price (USD)",
      data: marketAssets.map(asset => asset.price),
      borderWidth: 2,
      borderColor: "#4ade80",
      backgroundColor: "rgba(74, 222, 128, 0.1)",
      tension: 0.4,
      pointRadius: 2,
    }],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: true, labels: { color: chartAxisColor } } },
    scales: {
      x: { ticks: { color: chartAxisColor }, grid: { color: chartGridColor } },
      y: { ticks: { color: chartAxisColor }, grid: { color: chartGridColor } },
    },
  };

  return <div className="crypto-layout">
    <Sidebar />
    <main className="crypto-main">
      {marketAssets.length === 0 ? <div className="bcrypto-empty-state">
        <h2>Waiting for Market Data...</h2>
        <p>{marketError || "The chart will appear once crypto prices are received."}</p>
      </div> : <div className="bcrypto-content">
        <h2>Live Trading: {marketAssets[0]?.symbol || "BCrypto"}</h2>
        <div className="bcrypto-chart"><Line data={data} options={options} /></div>
        <div className="bcrypto-actions">
          <button type="button" className="bcrypto-buy" onClick={() => openTrade("buy")}>Open Buy Demo</button>
          <button type="button" className="bcrypto-sell" onClick={() => openTrade("sell")}>Open Sell Demo</button>
        </div>
        <div className="bcrypto-log">
          <h4>Recent Activity</h4>
          {log.length === 0 && <p>No transactions yet.</p>}
          {log.map((entry, index) => <div key={`${entry}-${index}`}>{entry}</div>)}
        </div>
      </div>}
    </main>
  </div>;
}
