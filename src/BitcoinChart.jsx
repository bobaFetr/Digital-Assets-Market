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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { getToken } from './Services/auth';
import './App.css';

// ✅ Register required components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const API_BASE = import.meta.env?.VITE_API_BASE ?? "";
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

    const res = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
      {
        params: {
          vs_currency: vsCurrency,
          days: 1,
          interval: "hourly",
        },
      }
    );

    const points = (res.data?.prices ?? []).map(([time, price]) => ({ time, price }));
    if (!points.length) {
      return false;
    }

    applySeries(points, "market");
    return true;
  };

  const fetchOrderBookSeries = async (token) => {
    if (!token) {
      return false;
    }

    const res = await axios.get(`${API_BASE}/api/orderbook`, {
      params: { symbol },
      headers: { Authorization: `Bearer ${token}` },
    });

    const points = (res.data ?? [])
      .map((item) => ({
        time: item.timestamp,
        price: item.price,
      }))
      .filter((item) => item.time != null && item.price != null)
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    if (!points.length) {
      return false;
    }

    applySeries(points, "orderbook");
    return true;
  };

  const fetchData = async () => {
    try {
      const token = getToken();
      if (!token) {
        const loaded = await fetchExternalSeries();
        if (!loaded) {
          setMeta({ count: 0, lastPrice: null, lastTime: null });
          setChartData({ labels: [], datasets: [] });
        }
        return;
      }

      const res = await axios.get(`${API_BASE}/api/trades`, {
        params: { symbol },
        headers: { Authorization: `Bearer ${token}` },
      });

      const sorted = [...res.data].sort(
        (a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()
      );

      const points = sorted.map((item) => ({ time: item.timeStamp, price: item.price }));
      const hasVariance =
        points.length > 1 && points.some((point) => Number(point.price) !== Number(points[0].price));

      if (points.length > 1 && hasVariance) {
        applySeries(points, "trades");
        return;
      }

      const loadedExternal = await fetchExternalSeries();
      if (loadedExternal) {
        return;
      }

      const loadedOrderBook = await fetchOrderBookSeries(token);
      if (!loadedOrderBook) {
        applySeries(points, "trades");
      }
    } catch (error) {
      console.error(`Error fetching ${symbol} data:`, error);
      try {
        const loadedExternal = await fetchExternalSeries();
        if (loadedExternal) {
          return;
        }

        const token = getToken();
        const loadedOrderBook = await fetchOrderBookSeries(token);
        if (!loadedOrderBook) {
          setMeta({ count: 0, lastPrice: null, lastTime: null });
          setChartData({ labels: [], datasets: [] });
        }
      } catch (externalError) {
        console.error(`Error fetching ${symbol} market data:`, externalError);
        setMeta({ count: 0, lastPrice: null, lastTime: null });
        setChartData({ labels: [], datasets: [] });
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // update every 10 seconds
    return () => clearInterval(interval);
  }, [symbol, refreshKey]);

  const options = {
    responsive: true,
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
    <div className="container">
      {/* <h1>Графика на цената</h1> */}
      <Line data={chartData} options={options} />
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
