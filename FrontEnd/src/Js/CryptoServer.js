import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const BINANCE_BASE_URL = process.env.BINANCE_BASE_URL || "https://api.binance.com/api/v3";
const ALLOWED_ORIGINS = String(process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions =
  ALLOWED_ORIGINS.length === 0
    ? {}
    : {
        origin(origin, callback) {
          if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
            return;
          }

          callback(new Error("Origin not allowed by CORS"));
        },
      };

app.use(cors(corsOptions));
app.use(express.json());

const fetchFromBinance = async (path) => {
  const response = await axios.get(`${BINANCE_BASE_URL}${path}`, {
    timeout: 15000,
    headers: {
      Accept: "application/json",
      "User-Agent": "dam-crypto-server/1.0",
    },
  });

  return response.data;
};

const registerMarketRoutes = ({ basePath, symbol, label }) => {
  app.get(basePath, async (_req, res) => {
    try {
      const data = await fetchFromBinance(`/ticker/price?symbol=${symbol}`);
      res.json(data);
    } catch (error) {
      console.error(`Failed to fetch ${label} price`, error?.message || error);
      res.status(500).json({ error: `Failed to fetch ${label} price data` });
    }
  });

  app.get(`${basePath}/history`, async (_req, res) => {
    try {
      const data = await fetchFromBinance(`/klines?symbol=${symbol}&interval=1m&limit=60`);
      const formatted = data.map((item) => ({
        time: item[0],
        price: parseFloat(item[4]),
      }));
      res.json(formatted);
    } catch (error) {
      console.error(`Failed to fetch ${label} history`, error?.message || error);
      res.status(500).json({ error: `Failed to fetch ${label} historical data` });
    }
  });

  app.get(`${basePath}/orders`, async (_req, res) => {
    try {
      const data = await fetchFromBinance(`/depth?symbol=${symbol}&limit=10`);
      res.json(data);
    } catch (error) {
      console.error(`Failed to fetch ${label} order book`, error?.message || error);
      res.status(500).json({ error: `Failed to fetch ${label} order book data` });
    }
  });
};

app.get("/", (_req, res) => {
  res.json({
    service: "CryptoServer",
    status: "ok",
    endpoints: [
      "/health",
      "/api/bitcoin",
      "/api/bitcoin/history",
      "/api/bitcoin/orders",
      "/api/bitcoincash",
      "/api/bitcoincash/history",
      "/api/bitcoincash/orders",
    ],
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

registerMarketRoutes({
  basePath: "/api/bitcoin",
  symbol: "BTCUSDT",
  label: "BTCUSDT",
});

registerMarketRoutes({
  basePath: "/api/bitcoincash",
  symbol: "BCHUSDT",
  label: "BCHUSDT",
});

app.listen(PORT, HOST, () => {
  console.log(`CryptoServer running on http://${HOST}:${PORT}`);
});
