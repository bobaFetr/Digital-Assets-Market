import React, { useEffect, useState } from "react";
import BitcoinChart from "./BitcoinChart";
import Sidebar from "./Components/Sidebar";
import { getToken } from "./Services/auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5149";

export default function BuyAndSell() {
  const [fromCurrency, setFromCurrency] = useState("BTC");
  const [toCurrency, setToCurrency] = useState("USD");
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
    <div className="crypto-layout">
      {/* Sidebar (same style as main page) */}
      <Sidebar />

      {/* Main Content */}
      <div className="crypto-main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="chart-header">Buy & Sell</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ color: "#9aa3ff" }}>
              Available: <strong>{available == null ? "--" : `${available.toFixed(6)} ${balanceCurrency}`}</strong>
            </div>
            <button className="btn-primary">Deposit</button>
          </div>
        </div>

        <div className="cards-grid" style={{ marginTop: "18px" }}>
          {[
            { name: "Ethereum", code: "ETH", rate: "+12.34%" },
            { name: "Bitcoin", code: "BTC", rate: "+12.34%" },
            { name: "Bitcoin Cash", code: "BTH", rate: "+11.34%" },
            { name: "Algorand", code: "ALGO", rate: "-12.34%" },
          ].map((coin) => (
            <div key={coin.code} className="coin-card">
              <div className="coin-header">
                <h4>{coin.name} ({coin.code})</h4>
              </div>
              <p className="reward-label">Reward Rate</p>
              <h3 className={`coin-rate ${coin.rate.startsWith("-") ? "rate-down" : "rate-up"}`}>
                {coin.rate}
              </h3>
            </div>
          ))}
        </div>

        <div className="chart-container" style={{ marginTop: "18px" }}>
          <h3 className="chart-header">Market Chart</h3>
          <BitcoinChart symbol={chartSymbol} refreshKey={chartRefreshTick} />
        </div>

        <div className="orderbook-section" style={{ marginTop: "18px" }}>
          <h3>Order Book ({pairSymbol})</h3>
          {orderBookError && (
            <div style={{ color: "#ff9a9a", fontSize: "13px", marginBottom: "8px" }}>
              {orderBookError}
            </div>
          )}
          {!orderBookError && orderBook.length === 0 && (
            <div style={{ color: "#9aa3ff", fontSize: "13px" }}>No order book entries yet.</div>
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
        <div className="chart-container" style={{ marginTop: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="chart-header">Exchange</h3>
            <div className="binance-tabs">
              <button
                className={`binance-tab buy ${orderType === "Buy" ? "active" : ""}`}
                onClick={() => setOrderType("Buy")}
              >
                Buy
              </button>
              <button
                className={`binance-tab sell ${orderType === "Sell" ? "active" : ""}`}
                onClick={() => setOrderType("Sell")}
              >
                Sell
              </button>
            </div>
          </div>
          <div className="binance-panel" style={{ background: "#0d0f1a", padding: "18px", borderRadius: "10px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button
                className={`binance-tab ${orderKind === "Market" ? "active" : ""}`}
                onClick={() => setOrderKind("Market")}
              >
                Market
              </button>
              <button
                className={`binance-tab ${orderKind === "Limit" ? "active" : ""}`}
                onClick={() => setOrderKind("Limit")}
              >
                Limit
              </button>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
              <label style={{ minWidth: "80px" }}>{orderType}</label>
              <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
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
                placeholder="Crypto amount"
                style={{ flex: 1 }}
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
                  style={{ flex: 1 }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <label style={{ minWidth: "80px" }}>Pay</label>
              <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} style={{ width: "120px" }}>
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
                  placeholder={`Amount in ${toCurrency}`}
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            {statusMessage && (
              <div style={{ marginTop: "12px", color: "#9aa3ff" }}>
                {statusMessage}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button className="btn-primary" onClick={handleConfirmExchange} disabled={isSubmitting}>
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
