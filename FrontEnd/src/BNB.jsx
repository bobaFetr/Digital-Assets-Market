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
import { request } from './Services/Service';
import './App.css';

// Register the chart components used on this page.
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

function BitcoinChart() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  const fetchData = async () => {
    try {
      const data = await request('/api/Bnb/history');
      const rows = Array.isArray(data) ? data : [];
      const labels = rows.map(item =>
        new Date(item.time).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
      );
      const prices = rows.map(item => item.price);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Цена на BNB (в USD)',
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
  }, []);

  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Време',
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
          text: 'Цена на BTC (в USD)',
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
        text: 'BTC PRICE LAST 60 MINUTES',
        color: '#f0f0f0',
      },
    },
  };

  return (
    <div className="container">
      {/* <h1>Графика на цената</h1> */}
      <Line data={chartData} options={options} />
    </div>
  );
}

export default BitcoinChart;
