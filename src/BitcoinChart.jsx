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

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5149";

function BitcoinChart({ symbol = "BTCUSD", refreshKey = 0 }) {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [meta, setMeta] = useState({ count: 0, lastPrice: null, lastTime: null });

  const fetchData = async () => {
    try {
      const token = getToken();
      if (!token) {
        setChartData({ labels: [], datasets: [] });
        return;
      }

      const res = await axios.get(`${API_BASE}/api/trades`, {
        params: { symbol },
        headers: { Authorization: `Bearer ${token}` },
      });

      const sorted = [...res.data].sort(
        (a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()
      );
      const labels = sorted.map(item =>
        new Date(item.timeStamp).toLocaleTimeString('bg-BG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
      const prices = sorted.map(item => item.price);

      const last = sorted[sorted.length - 1];
      setMeta({
        count: sorted.length,
        lastPrice: last?.price ?? null,
        lastTime: last?.timeStamp ?? null
      });

      setChartData({
        labels,
        datasets: [
          {
            label: `Price ${symbol}`,
            data: prices,
            borderColor: '#357859ff',
            backgroundColor: 'rgba(0, 255, 204, 0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#00ffcc',
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching BTC data:', error);
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
          text: 'Price of  BTC  (USD)',
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
        text: `${symbol} PRICE (RECENT)`,
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
