//import React, { useEffect} from 'react';
//import Chart from 'chart.js/auto';
import React, { useEffect, useState } from 'react';
import './App.css';
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getToken, request } from './Services/Service';

// ✅ Register required components
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

// API base is provided by Services/Service via centralized config
const COIN_GECKO_ID_BY_BASE = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  ALGO: "algorand",
};

const parseSymbol = (symbol) => {
  if (typeof symbol !== "string" || symbol.length < 6) {
    return { base: symbol ?? "", quote: "USD" };
  }

  const quote = symbol.slice(-3);
  const base = symbol.slice(0, -3);
  return { base, quote };
};

function BitcoinChart({ symbol = "BTCUSD", refreshKey = 0 }) {
  const { base, quote } = parseSymbol(symbol);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [meta, setMeta] = useState({ count: 0, lastPrice: null, lastTime: null });

  const applySeries = (points, sourceLabel) => {
    if (!Array.isArray(points) || points.length === 0) {
      setMeta({ count: 0, lastPrice: null, lastTime: null });
      setChartData({ labels: [], datasets: [] });
      return;
    }

    const labels = points.map((item) =>
      new Date(item.time).toLocaleTimeString("bg-BG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
    const prices = points.map((item) => Number(item.price));
    const last = points[points.length - 1];

    setMeta({
      count: points.length,
      lastPrice: Number(last.price),
      lastTime: last.time,
    });

    setChartData({
      labels,
      datasets: [
        {
          label: `Price ${base}/${quote} (${sourceLabel})`,
          data: prices,
          borderColor: "rgb(255, 127, 80)",
          backgroundColor: " rgba(255, 127, 80, 0.1)",
          tension: 0.3,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: " rgb(255, 127, 80)",
        },
      ],
    });
  };

  const fetchExternalSeries = async () => {
    const coinId = COIN_GECKO_ID_BY_BASE[base];
    const vsCurrency = quote?.toLowerCase() === "eur" ? "eur" : "usd";

    if (!coinId) {
      return false;
    }

    try {
      const data = await request(
        `/api/external/coingecko/${coinId}/market_chart?vs_currency=${encodeURIComponent(vsCurrency)}&days=1&interval=hourly`
      );

      const points = (data?.prices ?? []).map(([time, price]) => ({ time, price }));
      if (!points.length) {
        return false;
      }

      applySeries(points, "market");
      return true;
    } catch (err) {
      console.warn(`CoinGecko proxy failed for ${coinId}:`, err?.message || err);
      return false;
    }
  };

  const fetchData = async () => {
    try {
      const loadedExternal = await fetchExternalSeries();
      if (loadedExternal) {
        return;
      }

      const token = getToken();
      if (!token) {
        setMeta({ count: 0, lastPrice: null, lastTime: null });
        setChartData({ labels: [], datasets: [] });
        return;
      }

      const trades = await request(`/api/trades?symbol=${encodeURIComponent(symbol)}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const sortedTrades = [...(trades || [])].sort(
        (a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()
      );
      const tradePoints = sortedTrades
        .map((item) => ({ time: item.timeStamp, price: item.price }))
        .filter((item) => item.time != null && item.price != null);

      if (tradePoints.length > 0) {
        applySeries(tradePoints, "platform-trades");
        return;
      }

      const orderBook = await request(`/api/orderbook?symbol=${encodeURIComponent(symbol)}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const orderBookPoints = (orderBook ?? [])
        .map((item) => ({ time: item.timestamp, price: item.price }))
        .filter((item) => item.time != null && item.price != null)
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      if (orderBookPoints.length > 0) {
        applySeries(orderBookPoints, "platform-orderbook");
        return;
      }

      setMeta({ count: 0, lastPrice: null, lastTime: null });
      setChartData({ labels: [], datasets: [] });
    } catch (error) {
      console.error(`Error fetching ${symbol} data:`, error?.message || error);
      setMeta({ count: 0, lastPrice: null, lastTime: null });
      setChartData({ labels: [], datasets: [] });
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // update every 10 seconds
    return () => clearInterval(interval);
  }, [symbol, refreshKey]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Time',
        },
        ticks: {
          color: '#f0f0f0',
        },
        grid: {
          color: '#333',
        },
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: `Price (${quote})`,
        },
        ticks: {
          color: '#f0f0f0',
        },
        grid: {
          color: '#333',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#f0f0f0',
        },
        position: 'top',
      },
      title: {
        display: true,
        text: `${base}/${quote} PRICE (RECENT)`,
        color: '#f0f0f0',
      },
    },
  };

  return (
    <div style={{ width: "100%", margin: 0, padding: 0 }}>
      {/* <h1>Графика на цената</h1> */}
      <div style={{ width: "100%", height: "clamp(260px, 48vh, 420px)" }}>
        <Line data={chartData} options={options} />
      </div>
      <div style={{ marginTop: "10px", color: "#9aa3ff", fontSize: "12px" }}>
        {meta.count === 0
          ? "No data points yet."
          : `Points: ${meta.count} | Last: ${meta.lastPrice} @ ${new Date(meta.lastTime).toLocaleTimeString()}`}
      </div>
    </div>
  );
  // function OrderBook() {}////////////////////////////////////////
}

export default BitcoinChart;
