// import { Line } from "react-chartjs-2";
// import React, { useEffect, useState } from 'react';
// import { Routes, Route, Link } from "react-router-dom";
// import {
//   Chart as ChartJS,
//   LineElement,
//   PointElement,
//   LinearScale,
//   CategoryScale,
//   Tooltip,
//   Legend
// } from "chart.js";

// ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

// function BCrypto({ assets }) {
//   const [log, setLog] = useState([]); // to show buy/sell actions

//   const handleBuy = () => {
//     if (assets.length === 0) return;
//     const latest = assets[assets.length - 1];
//     setLog(prev => [...prev, `Bought ${latest.symbol} at $${latest.price}`]);
//     alert(`Bought ${latest.symbol} at $${latest.price}`);
//   };

//   const handleSell = () => {
//     if (assets.length === 0) return;
//     const latest = assets[assets.length - 1];
//     setLog(prev => [...prev, `Sold ${latest.symbol} at $${latest.price}`]);
//     alert(`Sold ${latest.symbol} at $${latest.price}`);
//   };

//   const data = {
//     labels: assets.map(a => new Date(a.timestamp).toLocaleTimeString()),
//     datasets: [
//       {
//         label: "Price",
//         data: assets.map(a => a.price),
//         borderWidth: 2,
//         borderColor: "blue",
//         backgroundColor: "rgba(0, 0, 255, 0.1)",
//         tension: 0.3
//       }
//     ]
//   };

//   return (
//     <div style={{ width: "100%", maxWidth: "800px", margin: "auto" }}>
//       <Line data={data} />

//       {/* Buy/Sell Buttons */}
//       <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
//         <button onClick={handleBuy} style={{ padding: "10px 20px", backgroundColor: "green", color: "white", border: "none", borderRadius: "5px" }}>
//           Buy
//         </button>
//         <button onClick={handleSell} style={{ padding: "10px 20px", backgroundColor: "red", color: "white", border: "none", borderRadius: "5px" }}>
//           Sell
//         </button>
//       </div>

//       {/* Optional Log of Actions */}
//       <div style={{ marginTop: "10px" }}>
//         {log.map((entry, idx) => (
//           <div key={idx}>{entry}</div>
//         ))}
//       </div>
//     </div>
//   );
// }
// export default BCrypto;
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import Sidebar from "./Components/Sidebar";
import { getToken } from "./Services/Service";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from "chart.js";

// Register ChartJS components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

// 1. Added a default empty array for 'assets' to prevent .map() crashes
function BCrypto({ assets = [] }) {
  const [log, setLog] = useState([]);
  const navigate = useNavigate();
  const isLightTheme =
    typeof document !== "undefined" && document.body.classList.contains("light-mode");
  const chartAxisColor = isLightTheme ? "#475569" : "#94a3b8";
  const chartGridColor = isLightTheme ? "rgba(148, 163, 184, 0.24)" : "rgba(148, 163, 184, 0.18)";

  const handleBuy = () => {
    if (!getToken()) {
      navigate("/sign-in", {
        state: { error: "Please sign in to use the trading demo." },
      });
      return;
    }

    const latest = assets[assets.length - 1];
    const message = `Opening buy flow for ${latest.symbol || 'Crypto'}.`;
    setLog(prev => [message, ...prev]); // Newest actions at the top
    navigate("/buy-sell?action=buy");
  };

  const handleSell = () => {
    if (!getToken()) {
      navigate("/sign-in", {
        state: { error: "Please sign in to use the trading demo." },
      });
      return;
    }

    const latest = assets[assets.length - 1];
    const message = `Opening sell flow for ${latest.symbol || 'Crypto'}.`;
    setLog(prev => [message, ...prev]);
    navigate("/buy-sell?action=sell");
  };

  // 3. Prepare Chart Data safely
  const data = {
    labels: assets.map(a => a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : ""),
    datasets: [
      {
        label: "Price (USD)",
        data: assets.map(a => a.price),
        borderWidth: 2,
        borderColor: "#4ade80", // Greenish for crypto
        backgroundColor: "rgba(74, 222, 128, 0.1)",
        tension: 0.4,
        pointRadius: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { color: chartAxisColor } }
    },
    scales: {
      x: { ticks: { color: chartAxisColor }, grid: { color: chartGridColor } },
      y: { ticks: { color: chartAxisColor }, grid: { color: chartGridColor } }
    }
  };

  const content = (!assets || assets.length === 0) ? (
    <div style={{ 
      padding: "50px", 
      textAlign: "center", 
      color: "var(--text-secondary)", 
      background: "var(--surface-inset)", 
      borderRadius: "12px",
      border: "1px solid var(--glass-border)",
      margin: "20px" 
    }}>
      <h2>Waiting for Market Data...</h2>
      <p>The chart will appear once crypto prices are received.</p>
    </div>
  ) : (
    <div style={{ width: "95%", maxWidth: "900px", margin: "20px auto", color: "var(--text-primary)" }}>
      <h2 style={{ marginBottom: "20px" }}>Live Trading: {assets[0]?.symbol || "BCrypto"}</h2>
      
      <div style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "15px", border: "1px solid var(--glass-border)", boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)" }}>
        <Line data={data} options={chartOptions} />
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: "30px", display: "flex", gap: "15px" }}>
        <button 
          onClick={handleBuy} 
          style={{ flex: 1, padding: "12px", backgroundColor: "#22c55e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
        >
          Open Buy Demo
        </button>
        <button 
          onClick={handleSell} 
          style={{ flex: 1, padding: "12px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
        >
          Open Sell Demo
        </button>
      </div>

      {/* Transaction Log */}
      <div style={{ marginTop: "30px", background: "var(--surface-inset)", padding: "15px", borderRadius: "8px", maxHeight: "200px", overflowY: "auto", border: "1px solid var(--glass-border)" }}>
        <h4 style={{ borderBottom: "1px solid var(--glass-border)", paddingBottom: "10px" }}>Recent Activity</h4>
        {log.length === 0 && <p style={{ color: "var(--text-secondary)" }}>No transactions yet.</p>}
        {log.map((entry, idx) => (
          <div key={idx} style={{ padding: "8px 0", fontSize: "0.9rem", borderBottom: "1px solid var(--glass-border)" }}>
            {entry}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        {content}
      </div>
    </div>
  );
}

export default BCrypto;
