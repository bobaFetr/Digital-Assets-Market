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
import { Line } from "react-chartjs-2";
import Sidebar from "./Components/Sidebar";
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

  const handleBuy = () => {
    const latest = assets[assets.length - 1];
    const message = `Bought ${latest.symbol || 'Crypto'} at $${latest.price}`;
    setLog(prev => [message, ...prev]); // Newest actions at the top
    alert(message);
  };

  const handleSell = () => {
    const latest = assets[assets.length - 1];
    const message = `Sold ${latest.symbol || 'Crypto'} at $${latest.price}`;
    setLog(prev => [message, ...prev]);
    alert(message);
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
      legend: { display: true, labels: { color: "#fff" } }
    },
    scales: {
      x: { ticks: { color: "#888" }, grid: { color: "rgba(255,255,255,0.1)" } },
      y: { ticks: { color: "#888" }, grid: { color: "rgba(255,255,255,0.1)" } }
    }
  };

  const content = (!assets || assets.length === 0) ? (
    <div style={{ 
      padding: "50px", 
      textAlign: "center", 
      color: "#7f8cff", 
      background: "#0d0f1a", 
      borderRadius: "12px",
      margin: "20px" 
    }}>
      <h2>Waiting for Market Data...</h2>
      <p>The chart will appear once crypto prices are received.</p>
    </div>
  ) : (
    <div style={{ width: "95%", maxWidth: "900px", margin: "20px auto", color: "white" }}>
      <h2 style={{ marginBottom: "20px" }}>Live Trading: {assets[0]?.symbol || "BCrypto"}</h2>
      
      <div style={{ background: "#1a1d2e", padding: "20px", borderRadius: "15px" }}>
        <Line data={data} options={chartOptions} />
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: "30px", display: "flex", gap: "15px" }}>
        <button 
          onClick={handleBuy} 
          style={{ flex: 1, padding: "12px", backgroundColor: "#22c55e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
        >
          BUY
        </button>
        <button 
          onClick={handleSell} 
          style={{ flex: 1, padding: "12px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
        >
          SELL
        </button>
      </div>

      {/* Transaction Log */}
      <div style={{ marginTop: "30px", background: "#0d0f1a", padding: "15px", borderRadius: "8px", maxHeight: "200px", overflowY: "auto" }}>
        <h4 style={{ borderBottom: "1px solid #333", paddingBottom: "10px" }}>Recent Activity</h4>
        {log.length === 0 && <p style={{ color: "#555" }}>No transactions yet.</p>}
        {log.map((entry, idx) => (
          <div key={idx} style={{ padding: "8px 0", fontSize: "0.9rem", borderBottom: "1px solid #222" }}>
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