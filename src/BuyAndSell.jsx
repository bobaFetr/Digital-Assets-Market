import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BitcoinChart from "./BitcoinChart";
import Sidebar from "./Components/Sidebar";
import { getToken } from "./Services/auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5149";
const BUY_SELL_FROM_CURRENCY_KEY = "buySell.fromCurrency";
const BUY_SELL_TO_CURRENCY_KEY = "buySell.toCurrency";

const readPersistedCurrency = (key, allowedValues, fallbackValue) => {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  const value = window.localStorage.getItem(key);
  return value && allowedValues.includes(value) ? value : fallbackValue;
};

export default function BuyAndSell() {
  const [searchParams] = useSearchParams();
  const [fromCurrency, setFromCurrency] = useState(() =>
    readPersistedCurrency(BUY_SELL_FROM_CURRENCY_KEY, ["BTC", "ETH", "BNB", "ALGO"], "BTC")
  );
  const [toCurrency, setToCurrency] = useState(() =>
    readPersistedCurrency(BUY_SELL_TO_CURRENCY_KEY, ["USD", "EUR"], "USD")
  );
  const [amountCrypto, setAmountCrypto] = useState(0);
  const [amountQuote, setAmountQuote] = useState(0);
  const [lastEdited, setLastEdited] = useState("crypto");
  const [available, setAvailable] = useState(null);
  const [quoteRate, setQuoteRate] = useState(24.5);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderType, setOrderType] = useState("Sell");
  const [orderKind, setOrderKind] = useState("Market");
  const [limitPrice, setLimitPrice] = useState("");
  const [isLimitPriceTouched, setIsLimitPriceTouched] = useState(false);
  const [chartRefreshTick, setChartRefreshTick] = useState(0);
  const [orderBook, setOrderBook] = useState([]);
  const [orderBookError, setOrderBookError] = useState("");
  const [marketCards, setMarketCards] = useState([]);

  const symbolMap = {
    USD: {
      BTC: "BTCUSD",
      ETH: "ETHUSD",
      BNB: "BNBUSD",
      ALGO: "ALGOUSD",
    },
    EUR: {
      BTC: "BTCEUR",
      ETH: "ETHEUR",
      BNB: "BNBEUR",
      ALGO: "ALGOEUR",
    },
  };
  const mappedSymbol = symbolMap[toCurrency]?.[fromCurrency] || "BTCUSD";
  const pairSymbol = mappedSymbol;
  const chartSymbol = mappedSymbol;
  const balanceCurrency = orderType === "Buy" ? toCurrency : fromCurrency;
  const cardCoins = [
    { name: "Ethereum", code: "ETH" },
    { name: "Bitcoin", code: "BTC" },
    { name: "Binance Coin", code: "BNB" },
    { name: "Algorand", code: "ALGO" },
  ];

  useEffect(() => {
    const action = (searchParams.get("action") || "").toLowerCase();
    const asset = (searchParams.get("asset") || "").toUpperCase();
    const quote = (searchParams.get("quote") || "").toUpperCase();

    if (action === "buy") {
      setOrderType("Buy");
    } else if (action === "sell") {
      setOrderType("Sell");
    }

    if (["BTC", "ETH", "BNB", "ALGO"].includes(asset)) {
      setFromCurrency(asset);
    }

    if (["USD", "EUR"].includes(quote)) {
      setToCurrency(quote);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadWallets = async () => {
      const token = getToken();
      if (!token) {
        setAvailable(null);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/wallets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();
        const total = data
          .filter((wallet) => wallet.currency === balanceCurrency)
          .reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0);
        setAvailable(total);
      } catch (error) {
        console.error("Error loading wallets:", error);
        setAvailable(null);
      }
    };

    loadWallets();
  }, [balanceCurrency]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(BUY_SELL_FROM_CURRENCY_KEY, fromCurrency);
    }
  }, [fromCurrency]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(BUY_SELL_TO_CURRENCY_KEY, toCurrency);
    }
  }, [toCurrency]);

  useEffect(() => {
    const loadQuote = async () => {
      const token = getToken();
      if (!token) {
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/trades?symbol=${mappedSymbol}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();
        if (!data.length) {
          return;
        }

        const sorted = [...data].sort(
          (a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()
        );
        const latest = sorted[sorted.length - 1];
        if (latest?.price) {
          setQuoteRate(Number(latest.price));
          if (orderKind === "Limit" && !isLimitPriceTouched && !limitPrice) {
            setLimitPrice(String(latest.price));
          }
          if (lastEdited === "crypto") {
            setAmountQuote(Number(amountCrypto) * Number(latest.price));
          } else {
            setAmountCrypto(Number(amountQuote) / Number(latest.price));
          }
        }
      } catch (error) {
        console.error("Error loading quote:", error);
      }
    };

    loadQuote();
  }, [mappedSymbol, orderKind, limitPrice, lastEdited, amountCrypto, amountQuote, isLimitPriceTouched]);

  useEffect(() => {
    if (orderKind !== "Limit") {
      setIsLimitPriceTouched(false);
      setLimitPrice("");
    }
  }, [orderKind]);

  useEffect(() => {
    const loadOrderBook = async () => {
      const token = getToken();
      if (!token) {
        setOrderBook([]);
        setOrderBookError("");
        return;
      }

      try {
        setOrderBookError("");
        const res = await fetch(`${API_BASE}/api/orderbook?symbol=${mappedSymbol}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();
        const sorted = [...data].sort((a, b) => Number(b.price) - Number(a.price));
        setOrderBook(sorted.slice(0, 12));
      } catch (error) {
        console.error("Error loading order book:", error);
        setOrderBookError(error?.message || "Failed to load order book.");
      }
    };

    loadOrderBook();
  }, [mappedSymbol, chartRefreshTick]);

  useEffect(() => {
    const loadMarketCards = async () => {
      const token = getToken();
      if (!token) {
        setMarketCards(cardCoins.map((coin) => ({ ...coin, rateText: "--", rateValue: null })));
        return;
      }

      try {
        const results = await Promise.all(
          cardCoins.map(async (coin) => {
            const symbol = symbolMap[toCurrency]?.[coin.code];
            if (!symbol) {
              return { ...coin, rateText: "--", rateValue: null };
            }

            const res = await fetch(`${API_BASE}/api/trades?symbol=${symbol}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!res.ok) {
              throw new Error(await res.text());
            }

            const data = await res.json();
            if (!Array.isArray(data) || data.length < 2) {
              return { ...coin, rateText: "--", rateValue: null };
            }

            const sorted = [...data].sort(
              (a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()
            );
            const latest = Number(sorted[sorted.length - 1]?.price);
            const previous = Number(sorted[sorted.length - 2]?.price);

            if (!previous || !latest) {
              return { ...coin, rateText: "--", rateValue: null };
            }

            const changePct = ((latest - previous) / previous) * 100;
            const sign = changePct >= 0 ? "+" : "";
            return {
              ...coin,
              rateText: `${sign}${changePct.toFixed(2)}%`,
              rateValue: changePct,
            };
          })
        );

        setMarketCards(results);
      } catch (error) {
        console.error("Error loading market cards:", error);
        setMarketCards(cardCoins.map((coin) => ({ ...coin, rateText: "--", rateValue: null })));
      }
    };

    loadMarketCards();
  }, [toCurrency]);

  const handleConfirmExchange = async () => {
    setStatusMessage("");

    const amountValue = Number(amountCrypto);
    if (!amountValue || amountValue <= 0) {
      setStatusMessage("Enter a valid amount.");
      return;
    }

    const token = getToken();
    if (!token) {
      setStatusMessage("Please log in to place an order.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          typeOfOrder: orderType === "Buy" ? 0 : 1,
          orderKind,
          symbol: pairSymbol,
          price: orderKind === "Limit" ? Number(limitPrice) || 0 : 0,
          amount: amountValue,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setStatusMessage("Order placed successfully.");
      setAmountCrypto(0);
      setAmountQuote(0);
      setChartRefreshTick((tick) => tick + 1);
    } catch (error) {
      console.error("Error placing order:", error);
      setStatusMessage(error?.message || "Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="crypto-layout" style={{ background: "#181a20", color: "#fff", minHeight: "100vh" }}>
      {/* Sidebar (same style as main page) */}
      <Sidebar />

      {/* Main Content */}
      <div className="crypto-main" style={{ background: "#181a20", color: "#fff", flex: 1, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="chart-header" style={{ color: "#ff7f50" }}>Buy & Sell</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ color: "#ff7f50" }}>
              Available: <strong>{available == null ? "--" : `${available.toFixed(6)} ${balanceCurrency}`}</strong>
            </div>
            <button className="btn-primary" style={{ background: "#ff7f50", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 600 }}>Deposit</button>
          </div>
        </div>

        <div className="cards-grid" style={{ marginTop: "18px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {marketCards.map((coin) => (
            <div key={coin.code} className="coin-card" style={{ background: "#23263a", borderRadius: 12, padding: 18, boxShadow: "0 2px 8px 0 #181a20", color: "#fff" }}>
              <div className="coin-header">
                <h4 style={{ color: "#ff7f50", margin: 0 }}>{coin.name} ({coin.code})</h4>
              </div>
              <p className="reward-label" style={{ color: "#fff", margin: "8px 0 0 0" }}>Reward Rate</p>
              <h3
                className={`coin-rate ${coin.rateValue == null || coin.rateValue >= 0 ? "rate-up" : "rate-down"}`}
                style={{ color: coin.rateValue == null || coin.rateValue >= 0 ? "#7cf29a" : "#ff4d4d", margin: 0 }}
              >
                {coin.rateText}
              </h3>
            </div>
          ))}
        </div>

        <div className="chart-container" style={{ marginTop: "18px", background: "#23263a", borderRadius: 12, padding: 18, boxShadow: "0 2px 8px 0 #181a20" }}>
          <h3 className="chart-header" style={{ color: "#ff7f50" }}>Market Chart</h3>
          <BitcoinChart key={chartSymbol} symbol={chartSymbol} refreshKey={chartRefreshTick} />
        </div>

        <div className="orderbook-section" style={{ marginTop: "18px", background: "#23263a", borderRadius: 12, padding: 18, boxShadow: "0 2px 8px 0 #181a20" }}>
          <h3 style={{ color: "#ff7f50" }}>Order Book ({pairSymbol})</h3>
          {orderBookError && (
            <div style={{ color: "#ff4d4d", fontSize: "13px", marginBottom: "8px" }}>
              {orderBookError}
            </div>
          )}
          {!orderBookError && orderBook.length === 0 && (
            <div style={{ color: "#fff", fontSize: "13px" }}>No order book entries yet.</div>
          )}
          <ul>
            {orderBook.map((entry) => (
              <li key={entry.orderBookId} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{Number(entry.price).toFixed(4)}</span>
                <span>{Number(entry.amount).toFixed(4)}</span>
                <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Buy/Sell Exchange Box */}
        <div className="chart-container" style={{ marginTop: "18px", background: "#23263a", borderRadius: 12, padding: 18, boxShadow: "0 2px 8px 0 #181a20" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="chart-header" style={{ color: "#ff7f50" }}>Exchange</h3>
            <div className="binance-tabs">
              <button
                className={`binance-tab buy ${orderType === "Buy" ? "active" : ""}`}
                onClick={() => setOrderType("Buy")}
                style={{
                  background: orderType === "Buy" ? "#ff7f50" : "#23263a",
                  color: orderType === "Buy" ? "#fff" : "#ff7f50",
                  border: "1px solid #ff7f50",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontWeight: 600,
                  marginRight: 8,
                  cursor: "pointer"
                }}
              >
                Buy
              </button>
              <button
                className={`binance-tab sell ${orderType === "Sell" ? "active" : ""}`}
                onClick={() => setOrderType("Sell")}
                style={{
                  background: orderType === "Sell" ? "#ff7f50" : "#23263a",
                  color: orderType === "Sell" ? "#fff" : "#ff7f50",
                  border: "1px solid #ff7f50",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Sell
              </button>
            </div>
          </div>
          <div
            className="binance-panel"
            style={{ background: "#181a20", padding: "18px", borderRadius: "10px" }}
          >
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button
                className={`binance-tab ${orderKind === "Market" ? "active" : ""}`}
                onClick={() => setOrderKind("Market")}
                style={{
                  background: orderKind === "Market" ? "#ff7f50" : "#181a20",
                  color: orderKind === "Market" ? "#fff" : "#ff7f50",
                  border: "1px solid #ff7f50",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontWeight: 600,
                  marginRight: 8,
                  cursor: "pointer"
                }}
              >
                Market
              </button>
              <button
                className={`binance-tab ${orderKind === "Limit" ? "active" : ""}`}
                onClick={() => setOrderKind("Limit")}
                style={{
                  background: orderKind === "Limit" ? "#ff7f50" : "#181a20",
                  color: orderKind === "Limit" ? "#fff" : "#ff7f50",
                  border: "1px solid #ff7f50",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Limit
              </button>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
              <label style={{ minWidth: "80px" }}>
                {orderType === "Buy" ? "Buy Coin" : "Sell Coin"}
              </label>
              <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} style={{ background: "#23263a", color: "#fff", border: "1px solid #ff7f50", borderRadius: 8, padding: "6px 10px" }}>
                <option>BTC</option>
                <option>ETH</option>
                <option>BNB</option>
                <option>ALGO</option>
              </select>
              <input
                type="number"
                value={amountCrypto}
                onChange={(e) => {
                  setLastEdited("crypto");
                  setAmountCrypto(e.target.value);
                  if (Number(quoteRate) > 0) {
                    setAmountQuote(Number(e.target.value) * Number(quoteRate));
                  }
                }}
                placeholder={orderType === "Buy" ? "Amount to buy (coin)" : "Amount to sell (coin)"}
                style={{ flex: 1, background: "#23263a", color: "#fff", border: "1px solid #ff7f50", borderRadius: 8, padding: "6px 10px" }}
              />
            </div>

            {orderKind === "Limit" && (
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                <label style={{ minWidth: "80px" }}>Price</label>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => {
                    setIsLimitPriceTouched(true);
                    setLimitPrice(e.target.value);
                  }}
                  placeholder={`Price in ${toCurrency}`}
                  style={{ flex: 1, background: "#23263a", color: "#fff", border: "1px solid #ff7f50", borderRadius: 8, padding: "6px 10px" }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <label style={{ minWidth: "80px" }}>
                {orderType === "Buy" ? "Total Cost" : "Total Value"}
              </label>
              <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} style={{ width: "120px", background: "#23263a", color: "#fff", border: "1px solid #ff7f50", borderRadius: 8, padding: "6px 10px" }}>
                <option>USD</option>
                <option>EUR</option>
              </select>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  value={amountQuote}
                  onChange={(e) => {
                    setLastEdited("quote");
                    setAmountQuote(e.target.value);
                    if (Number(quoteRate) > 0) {
                      setAmountCrypto(Number(e.target.value) / Number(quoteRate));
                    }
                  }}
                  placeholder={
                    orderType === "Buy"
                      ? `How much to spend (${toCurrency})`
                      : `Estimated proceeds (${toCurrency})`
                  }
                  style={{ width: "100%", background: "#23263a", color: "#fff", border: "1px solid #ff7f50", borderRadius: 8, padding: "6px 10px" }}
                />
              </div>
            </div>

            {statusMessage && (
              <div style={{ marginTop: "12px", color: "#ff7f50" }}>
                {statusMessage}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button className="btn-primary" onClick={handleConfirmExchange} disabled={isSubmitting} style={{ background: "#ff7f50", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer" }}>
                {isSubmitting ? "Submitting..." : "Confirm Exchange"}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Right Sidebar */}
      {/* <aside className="crypto-right-sidebar">
        <div className="balance-card">
          <div className="balance-title">Total Balance</div>
          <h1 className="balance-amount">$37.4343</h1>
        </div>

        <div className="exchange-section">
          <p className="exchange-label">You Sell</p>
          <div className="currency-box">
            <span>{fromCurrency}</span>
            <span>{amount || "0.00"}</span>
          </div>
          <p className="exchange-label">You Get</p>
          <div className="currency-box">
            <span>{toCurrency}</span>
            <span>{amount ? `${(amount * 24.5).toFixed(4)}` : "0.00"}</span>
          </div>
          <button className="btn-primary">Exchange Now</button>
        </div>

        <div>
          <h3 className="chart-header">Market</h3>
          <div className="market-list">
            {[
              { code: "BTC", change: "+12.34%" },
              { code: "ACA", change: "-2.34%" },
              { code: "ALGO", change: "-12.34%" },
              { code: "BTH", change: "+12.34%" },
              { code: "BTL", change: "+12.34%" },
            ].map((m) => (
              <div key={m.code} className="market-item">
                <span className="market-code">{m.code}</span>
                <span className={m.change.startsWith("-") ? "rate-down" : "rate-up"}>{m.change}</span>
              </div>
            ))}
          </div>
          <div className="footer">
            <footer>
              <Link>Instagram</Link>
              <Link>Facebook</Link>
              <Link>Twitter</Link>
            </footer>
          </div>
        </div>
      </aside> */}
    </div>
  );
}
