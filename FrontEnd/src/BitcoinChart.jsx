import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler } from
"chart.js";
import { Line } from "react-chartjs-2";
import { request } from "./Services/Service";

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

const MOBILE_BREAKPOINT = 560;
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
  const [seriesPoints, setSeriesPoints] = useState([]);
  const [meta, setMeta] = useState({ count: 0, lastPrice: null, lastTime: null });
  const [isLightTheme, setIsLightTheme] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }

    return document.body.classList.contains("light-mode");
  });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.innerWidth <= MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const updateTheme = () => {
      setIsLightTheme(document.body.classList.contains("light-mode"));
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const applySeries = (points) => {
    if (!Array.isArray(points) || points.length === 0) {
      setMeta({ count: 0, lastPrice: null, lastTime: null });
      setSeriesPoints([]);
      return;
    }

    const last = points[points.length - 1];
    setMeta({
      count: points.length,
      lastPrice: Number(last.price),
      lastTime: last.time
    });
    setSeriesPoints(points);
  };

  const clearSeries = () => {
    setMeta({ count: 0, lastPrice: null, lastTime: null });
    setSeriesPoints([]);
  };

  const fetchData = async () => {
    try {
      const candles = await request(
        `/api/market/klines?symbol=${encodeURIComponent(symbol)}&interval=1m&limit=120`
      );

      const candlePoints = (candles ?? []).
      map((item) => ({ time: item.closeTimeUtc, price: Number(item.close) })).
      filter((item) => item.time != null && Number.isFinite(item.price));

      if (candlePoints.length > 0) {
        applySeries(candlePoints);
        return;
      }

      clearSeries();
    } catch (error) {
      console.error(`Error fetching ${symbol} data:`, error?.message || error);
      clearSeries();
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [symbol, refreshKey]);

  const visiblePoints = useMemo(() => {
    const preferredCount = isMobile ? 30 : 80;
    return seriesPoints.slice(-preferredCount);
  }, [seriesPoints, isMobile]);

  const chartData = useMemo(() => {
    const labels = visiblePoints.map((item) =>
    new Date(item.time).toLocaleTimeString("bg-BG", {
      hour: "2-digit",
      minute: "2-digit",
      ...(isMobile ? {} : { second: "2-digit" })
    })
    );

    return {
      labels,
      datasets: [
      {
        label: `${base}/${quote}`,
        data: visiblePoints.map((item) => item.price),
        borderColor: "rgb(255, 127, 80)",
        backgroundColor: "rgba(255, 127, 80, 0.18)",
        borderWidth: isMobile ? 3 : 2,
        tension: 0.35,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHitRadius: 16
      }]

    };
  }, [visiblePoints, base, quote, isMobile]);

  const options = useMemo(
    () => {
      const axisColor = isLightTheme ? "#334155" : "#f0f0f0";
      const titleColor = isLightTheme ? "#0f172a" : "#f0f0f0";
      const gridColor = isLightTheme ? "rgba(15, 23, 42, 0.12)" : "rgba(255, 255, 255, 0.08)";
      const borderColor = isLightTheme ? "rgba(15, 23, 42, 0.18)" : "rgba(255, 255, 255, 0.12)";

      return {
        responsive: true,
        maintainAspectRatio: false,
        normalized: true,
        animation: false,
        interaction: {
          intersect: false,
          mode: "index"
        },
        scales: {
          x: {
            type: "category",
            title: {
              display: !isMobile,
              text: "Time",
              color: titleColor
            },
            ticks: {
              color: axisColor,
              autoSkip: true,
              maxTicksLimit: isMobile ? 4 : 8,
              maxRotation: 0,
              minRotation: 0,
              font: {
                size: isMobile ? 11 : 12
              }
            },
            grid: {
              color: gridColor,
              drawTicks: false
            },
            border: {
              color: borderColor
            }
          },
          y: {
            type: "linear",
            title: {
              display: !isMobile,
              text: `Price (${quote})`,
              color: titleColor
            },
            ticks: {
              color: axisColor,
              maxTicksLimit: isMobile ? 5 : 7,
              font: {
                size: isMobile ? 11 : 12
              }
            },
            grid: {
              color: gridColor
            },
            border: {
              color: borderColor
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: isMobile ? `${base}/${quote}` : `${base}/${quote} PRICE (RECENT)`,
            color: titleColor,
            font: {
              size: isMobile ? 14 : 16,
              weight: "600"
            },
            padding: {
              bottom: isMobile ? 12 : 16
            }
          },
          tooltip: {
            displayColors: false,
            backgroundColor: "rgba(11, 14, 17, 0.92)",
            titleColor: "#ffffff",
            bodyColor: "#dbe4ff",
            padding: 10,
            callbacks: {
              label: (context) => `Price: ${context.formattedValue} ${quote}`
            }
          }
        }
      };
    },
    [base, quote, isMobile, isLightTheme]
  );

  return (
    <div>
      <div className="market-chart-toolbar">
        <div className="market-chart-toolbar__meta">
          <span>Last price</span>
          <strong>{meta.lastPrice == null ? "--" : `${meta.lastPrice} ${quote}`}</strong>
        </div>
      </div>
      <div
        className={`market-chart-frame${isMobile ? " market-chart-frame--mobile" : ""}`}>





        <Line data={chartData} options={options} />
      </div>
      <div>






        {meta.count === 0 ?
        "No data points yet." :
        `Showing ${visiblePoints.length} of ${meta.count} points | Last: ${meta.lastPrice} @ ${new Date(meta.lastTime).toLocaleTimeString()}`}
      </div>
    </div>);

}

export default BitcoinChart;
