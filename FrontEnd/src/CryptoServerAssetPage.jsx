import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import Sidebar from "./Components/Sidebar";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const getCryptoServerBase = () => {
  const configuredBase = String(import.meta.env.VITE_CRYPTO_SERVER_BASE || "")
    .trim()
    .replace(/\/+$/, "");

  if (configuredBase) {
    return configuredBase;
  }

  if (typeof window === "undefined") {
    return "http://localhost:3001";
  }

  const hostname = window.location.hostname || "localhost";
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://${hostname}:3001`;
  }

  return "";
};

const formatUsd = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount >= 1 ? 2 : 4,
    maximumFractionDigits: amount >= 1 ? 2 : 6,
  }).format(amount);
};

const panelStyle = {
  background: "var(--surface-elevated)",
  border: "1px solid var(--glass-border)",
  borderRadius: 18,
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  padding: 20,
};

export default function CryptoServerAssetPage({
  title,
  symbol,
  pricePath,
  historyPath,
  ordersPath,
}) {
  const [priceData, setPriceData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [ordersData, setOrdersData] = useState({ bids: [], asks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchJson = async (path) => {
      const baseUrl = getCryptoServerBase();
      if (!baseUrl) {
        throw new Error("Crypto service URL is not configured.");
      }

      const response = await fetch(`${baseUrl}${path}`);
      if (!response.ok) {
        throw new Error(`Unable to load ${title}.`);
      }
      return response.json();
    };

    const loadData = async () => {
      try {
        const [price, history, orders] = await Promise.all([
          fetchJson(pricePath),
          fetchJson(historyPath),
          fetchJson(ordersPath),
        ]);

        if (!active) {
          return;
        }

        setPriceData(price);
        setHistoryData(Array.isArray(history) ? history : []);
        setOrdersData({
          bids: Array.isArray(orders?.bids) ? orders.bids : [],
          asks: Array.isArray(orders?.asks) ? orders.asks : [],
        });
        setError("");
      } catch (err) {
        if (!active) {
          return;
        }

        setError(err?.message || `Unable to load ${title}.`);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();
    const intervalId = setInterval(loadData, 10000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [historyPath, ordersPath, pricePath, title]);

  const chartData = {
    labels: historyData.map((item) =>
      new Date(item.time).toLocaleTimeString("bg-BG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    ),
    datasets: [
      {
        label: `${symbol} price`,
        data: historyData.map((item) => Number(item.price)),
        borderColor: "#ff7f50",
        backgroundColor: "rgba(255, 127, 80, 0.12)",
        tension: 0.3,
        fill: true,
        pointRadius: 2,
        pointBackgroundColor: "#ff7f50",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: "#cbd5f5",
        },
        grid: {
          color: "rgba(148, 163, 184, 0.18)",
        },
      },
      y: {
        ticks: {
          color: "#cbd5f5",
        },
        grid: {
          color: "rgba(148, 163, 184, 0.18)",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#f8fafc",
        },
      },
      title: {
        display: true,
        text: `${symbol} live history`,
        color: "#f8fafc",
      },
    },
  };

  return (
    <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        <div style={{ display: "grid", gap: 20 }}>
          <div style={panelStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: "var(--text-primary)" }}>{title}</h2>
                <div style={{ marginTop: 8, color: "var(--text-secondary)" }}>
                  Data source: CryptoServer.js
                </div>
              </div>
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: 14,
                  background: "var(--surface-inset)",
                  border: "1px solid var(--glass-border)",
                  minWidth: 180,
                }}
              >
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Current price</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "var(--brand-accent)" }}>
                  {formatUsd(priceData?.price)}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {priceData?.symbol || symbol}
                </div>
              </div>
            </div>
            {loading && (
              <div style={{ marginTop: 18, color: "var(--text-secondary)" }}>Loading market data...</div>
            )}
            {error && (
              <div style={{ marginTop: 18, color: "var(--error-main)" }}>{error}</div>
            )}
          </div>

          <div style={panelStyle}>
            <div style={{ height: "clamp(260px, 46vh, 420px)" }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            <div style={panelStyle}>
              <h3 style={{ marginTop: 0, color: "var(--text-primary)" }}>Top bids</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {ordersData.bids.slice(0, 5).map((bid, index) => (
                  <div
                    key={`bid-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "var(--surface-inset)",
                    }}
                  >
                    <span style={{ color: "var(--text-primary)" }}>{formatUsd(bid[0])}</span>
                    <span style={{ color: "var(--text-secondary)" }}>{bid[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={panelStyle}>
              <h3 style={{ marginTop: 0, color: "var(--text-primary)" }}>Top asks</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {ordersData.asks.slice(0, 5).map((ask, index) => (
                  <div
                    key={`ask-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "var(--surface-inset)",
                    }}
                  >
                    <span style={{ color: "var(--text-primary)" }}>{formatUsd(ask[0])}</span>
                    <span style={{ color: "var(--text-secondary)" }}>{ask[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
