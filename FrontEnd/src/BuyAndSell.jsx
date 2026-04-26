import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BitcoinChart from "./BitcoinChart";
import Sidebar from "./Components/Sidebar";
import { getToken, request } from "./Services/Service";

const BUY_SELL_FROM_CURRENCY_KEY = "buySell.fromCurrency";
const BUY_SELL_TO_CURRENCY_KEY = "buySell.toCurrency";
const MOBILE_BREAKPOINT = 560;

const readPersistedCurrency = (key, allowedValues, fallbackValue) => {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  const value = window.localStorage.getItem(key);
  return value && allowedValues.includes(value) ? value : fallbackValue;
};

export default function BuyAndSell() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [quoteRate, setQuoteRate] = useState(24.5);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderType, setOrderType] = useState("Sell");
  const [orderKind, setOrderKind] = useState("Limit");
  const [limitPrice, setLimitPrice] = useState("");
  const [isLimitPriceTouched, setIsLimitPriceTouched] = useState(false);
  const [chartRefreshTick, setChartRefreshTick] = useState(0);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [orderBookError, setOrderBookError] = useState("");
  const [marketCards, setMarketCards] = useState([]);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.innerWidth <= MOBILE_BREAKPOINT;
  });

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
  const effectiveRate =
    orderKind === "Limit" && Number(limitPrice) > 0 ? Number(limitPrice) : Number(quoteRate);
  const cardCoins = [
    { name: "Ethereum", code: "ETH" },
    { name: "Bitcoin", code: "BTC" },
    { name: "Binance Coin", code: "BNB" },
    { name: "Algorand", code: "ALGO" },
  ];
  const pageBg = "var(--bg-color)";
  const panelBg = "var(--card-bg)";
  const insetBg = "var(--surface-inset)";
  const textColor = "var(--text-primary)";
  const mutedText = "var(--text-secondary)";
  const accentColor = "var(--brand-accent)";
  const borderColor = "var(--glass-border)";
  const errorColor = "var(--error-main)";
  const compactInputStyle = {
    width: "100%",
    maxWidth: 220,
    background: panelBg,
    color: textColor,
    border: `1px solid ${accentColor}`,
    borderRadius: 8,
    padding: "8px 10px",
  };
  const wideInputStyle = {
    width: "100%",
    maxWidth: 260,
    background: panelBg,
    color: textColor,
    border: `1px solid ${accentColor}`,
    borderRadius: 8,
    padding: "8px 10px",
  };

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

  const loadWallets = async () => {
    const token = getToken();
    if (!token) {
      setAvailable(null);
      return;
    }

    setIsLoadingAvailable(true);
    try {
      const data = await request(`/api/wallets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const list = Array.isArray(data) ? data : [];
      const normalizedBalanceCurrency = String(balanceCurrency || "").toUpperCase();
      const selectedWallet = list.find(
        (wallet) => String(wallet.currency || "").toUpperCase() === normalizedBalanceCurrency
      );
      setAvailable(selectedWallet ? Number(selectedWallet.balance || 0) : 0);
    } catch (error) {
      console.error("Error loading wallets:", error);
      setAvailable(null);
    } finally {
      setIsLoadingAvailable(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, [balanceCurrency]);

  // Poll available balance periodically while on page
  useEffect(() => {
    const interval = setInterval(() => {
      const token = getToken();
      if (token) loadWallets();
    }, 10000); // every 10s

    return () => clearInterval(interval);
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
      try {
        const data = await request(`/api/market/ticker?symbol=${mappedSymbol}`);
        if (!data?.lastPrice) {
          return;
        }

        setQuoteRate(Number(data.lastPrice));
        if (orderKind === "Limit" && !isLimitPriceTouched && !limitPrice) {
          setLimitPrice(String(data.lastPrice));
        }
        const nextRate =
          orderKind === "Limit" && Number(limitPrice) > 0 ? Number(limitPrice) : Number(data.lastPrice);
        if (lastEdited === "crypto") {
          setAmountQuote(Number(amountCrypto) * Number(nextRate));
        } else if (Number(nextRate) > 0) {
          setAmountCrypto(Number(amountQuote) / Number(nextRate));
        }
      } catch (error) {
        console.error("Error loading quote:", error);
      }
    };

    loadQuote();
  }, [mappedSymbol, orderKind, limitPrice, lastEdited, amountCrypto, amountQuote, isLimitPriceTouched]);

  useEffect(() => {
    const rate = Number(effectiveRate);
    if (!rate || rate <= 0) {
      return;
    }

    if (lastEdited === "crypto") {
      setAmountQuote(Number(amountCrypto) * rate);
    } else {
      setAmountCrypto(Number(amountQuote) / rate);
    }
  }, [effectiveRate, lastEdited]);

  useEffect(() => {
    if (orderKind !== "Limit") {
      setIsLimitPriceTouched(false);
      return;
    }

    if (!isLimitPriceTouched && !limitPrice && Number(quoteRate) > 0) {
      setLimitPrice(String(Number(quoteRate)));
    }
  }, [orderKind, quoteRate, isLimitPriceTouched, limitPrice]);

  useEffect(() => {
    const loadOrderBook = async () => {
      if (!mappedSymbol) {
        setOrderBook({ bids: [], asks: [] });
        setOrderBookError("");
        return;
      }

      try {
        setOrderBookError("");
        const data = await request(`/api/market/depth?symbol=${mappedSymbol}&limit=12`);
        setOrderBook({
          bids: Array.isArray(data?.bids) ? data.bids : [],
          asks: Array.isArray(data?.asks) ? data.asks : [],
        });
      } catch (error) {
        console.error("Error loading order book:", error);
        setOrderBookError(error?.message || "Failed to load order book.");
        setOrderBook({ bids: [], asks: [] });
      }
    };

    loadOrderBook();
  }, [mappedSymbol, chartRefreshTick]);

  useEffect(() => {
    const loadMarketCards = async () => {
      try {
        const results = await Promise.all(
          cardCoins.map(async (coin) => {
            const symbol = symbolMap[toCurrency]?.[coin.code];
            if (!symbol) {
              return { ...coin, rateText: "--", rateValue: null };
            }

            const data = await request(`/api/market/ticker?symbol=${symbol}`);
            if (data?.priceChangePercent == null) {
              return { ...coin, rateText: "--", rateValue: null };
            }
            const changePct = Number(data.priceChangePercent);
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

    if (orderKind === "Limit" && (!Number(limitPrice) || Number(limitPrice) <= 0)) {
      setStatusMessage("Enter a valid limit price.");
      return;
    }

    if (orderKind === "Market") {
      const depthSide = orderType === "Buy" ? orderBook.asks : orderBook.bids;
      const relevantEntries = (depthSide || []).filter((entry) => Number(entry.price) > 0);
      const liquidityAmount = relevantEntries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);

      if (!relevantEntries.length) {
        setStatusMessage("No market liquidity right now. Switch to Limit to place an order.");
        return;
      }

      if (liquidityAmount < amountValue) {
        setStatusMessage("Market liquidity is too low for this amount. Reduce size or use Limit.");
        return;
      }
    }

    const token = getToken();
    if (!token) {
      setStatusMessage("Please log in to place an order.");
      return;
    }

    setIsSubmitting(true);
    try {
      await request(`/api/orders`, {
        method: "POST",
        headers: {
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

      setStatusMessage("Order placed successfully.");
      setAmountCrypto(0);
      setAmountQuote(0);
        setChartRefreshTick((tick) => tick + 1);
        // refresh wallets after placing an order so user sees updated balance
        try {
          await loadWallets();
        } catch (e) {
          // ignore; loadWallets logs errors
        }
    } catch (error) {
      console.error("Error placing order:", error);
      setStatusMessage(error?.message || "Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mobilePrimaryLabel = orderType === "Buy" ? "You Pay" : "You Sell";
  const mobileSecondaryLabel = orderType === "Buy" ? "You Receive" : "You Get";
  const rateLabel = `${Number(quoteRate || 0).toFixed(4)} ${toCurrency}`;
  const availableBalance = Number.isFinite(Number(available)) ? Number(available) : null;
  const quickAmountOptions = [25, 50, 75, 100];
  const tradeMeta = [
    { label: "Pair", value: pairSymbol },
    {
      label: "Available",
      value: availableBalance == null ? "--" : `${availableBalance.toFixed(isMobile ? 4 : 6)} ${balanceCurrency}`,
    },
    { label: "Mode", value: `${orderType} ${orderKind}` },
    { label: "Price", value: rateLabel },
  ];

  const applyQuickAmount = (percentage) => {
    if (availableBalance == null || availableBalance <= 0 || Number(effectiveRate) <= 0) {
      return;
    }

    if (orderType === "Buy") {
      const nextQuote = availableBalance * (percentage / 100);
      const nextCrypto = nextQuote / Number(effectiveRate);
      setLastEdited("quote");
      setAmountQuote(Number(nextQuote.toFixed(2)));
      setAmountCrypto(Number(nextCrypto.toFixed(8)));
      return;
    }

    const nextCrypto = availableBalance * (percentage / 100);
    const nextQuote = nextCrypto * Number(effectiveRate);
    setLastEdited("crypto");
    setAmountCrypto(Number(nextCrypto.toFixed(8)));
    setAmountQuote(Number(nextQuote.toFixed(2)));
  };

  return (
    <div className="crypto-layout" style={{ background: pageBg, color: textColor, minHeight: "100vh" }}>
      {/* Sidebar (same style as main page) */}
      <Sidebar />

      {/* Main Content */}
      <div className="crypto-main buy-sell-page" style={{ background: pageBg, color: textColor, flex: 1, padding: "clamp(12px, 3vw, 24px)" }}>
        <div className="buy-sell-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="chart-header" style={{ color: accentColor }}>Buy & Sell</h2>
          <div className="buy-sell-toolbar-actions" style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <div className="buy-sell-balance" style={{ color: accentColor, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span>Available:</span>
              <strong>{available == null ? "--" : `${available.toFixed(6)} ${balanceCurrency}`}</strong>
              {isLoadingAvailable ? (
                <span style={{ fontSize: 12, color: mutedText, opacity: 0.9 }}>Refreshing...</span>
              ) : (
                <button onClick={loadWallets} style={{ background: "transparent", color: accentColor, border: `1px solid ${accentColor}`, borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>Refresh</button>
              )}
            </div>
            <button
              className="btn-primary"
              onClick={() => navigate("/wallets")}
              style={{ background: accentColor, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 600 }}
            >
              {isMobile ? "Deposit" : "Deposit funds"}
            </button>
          </div>
        </div>

        <div className="cards-grid buy-sell-cards-grid buy-sell-section buy-sell-section--market" style={{ marginTop: "18px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {marketCards.map((coin) => (
            <div key={coin.code} className="coin-card" style={{ background: panelBg, borderRadius: 12, padding: 18, boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)", color: textColor, border: `1px solid ${borderColor}` }}>
              <div className="coin-header">
                <h4 style={{ color: accentColor, margin: 0 }}>{coin.name} ({coin.code})</h4>
              </div>
              <p className="reward-label" style={{ color: mutedText, margin: "8px 0 0 0" }}>Reward Rate</p>
              <h3
                className={`coin-rate ${coin.rateValue == null || coin.rateValue >= 0 ? "rate-up" : "rate-down"}`}
                style={{ color: coin.rateValue == null || coin.rateValue >= 0 ? accentColor : errorColor, margin: 0 }}
              >
                {coin.rateText}
              </h3>
            </div>
          ))}
        </div>

        <div className="chart-container buy-sell-panel buy-sell-section buy-sell-section--chart" style={{ marginTop: "18px", background: panelBg, borderRadius: 12, padding: 18, boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)", border: `1px solid ${borderColor}` }}>
          <div className="buy-sell-chart-header">
            <div>
              <h3 className="chart-header" style={{ color: accentColor, marginBottom: isMobile ? 6 : 20 }}>
                {isMobile ? `${fromCurrency}/${toCurrency} Overview` : "Market Chart"}
              </h3>
              {isMobile && (
                <p className="buy-sell-chart-subtitle" style={{ margin: 0, color: mutedText, fontSize: 13 }}>
                  Short-range price action with quick timeframe switches.
                </p>
              )}
            </div>
            <div className="buy-sell-rate-chip">
              <span>Market</span>
              <strong>{rateLabel}</strong>
            </div>
          </div>
          <BitcoinChart key={chartSymbol} symbol={chartSymbol} refreshKey={chartRefreshTick} />
        </div>

        <div className="orderbook-section buy-sell-panel buy-sell-orderbook buy-sell-section buy-sell-section--orderbook" style={{ marginTop: "18px", background: panelBg, borderRadius: 12, padding: 18, boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)", border: `1px solid ${borderColor}` }}>
          <h3 style={{ color: accentColor }}>Order Book ({pairSymbol})</h3>
          {orderBookError && (
            <div style={{ color: errorColor, fontSize: "13px", marginBottom: "8px" }}>
              {orderBookError}
            </div>
          )}
          {!orderBookError && orderBook.asks.length === 0 && orderBook.bids.length === 0 && (
            <div style={{ color: mutedText, fontSize: "13px" }}>No market depth available yet.</div>
          )}
          {orderBook.asks.length > 0 && (
            <>
              <div style={{ color: errorColor, fontWeight: 600, marginTop: 10, marginBottom: 6 }}>Asks</div>
              <ul className="buy-sell-orderbook-list">
                {orderBook.asks.map((entry, index) => (
                  <li key={`ask-${index}`} className="buy-sell-orderbook-item" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{Number(entry.price).toFixed(4)}</span>
                    <span>{Number(entry.quantity).toFixed(4)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {orderBook.bids.length > 0 && (
            <>
              <div style={{ color: accentColor, fontWeight: 600, marginTop: 10, marginBottom: 6 }}>Bids</div>
              <ul className="buy-sell-orderbook-list">
                {orderBook.bids.map((entry, index) => (
                  <li key={`bid-${index}`} className="buy-sell-orderbook-item" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{Number(entry.price).toFixed(4)}</span>
                    <span>{Number(entry.quantity).toFixed(4)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Buy/Sell Exchange Box */}
        <div className="chart-container buy-sell-panel buy-sell-section buy-sell-section--exchange" style={{ marginTop: "18px", background: panelBg, borderRadius: 12, padding: 18, boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)", border: `1px solid ${borderColor}` }}>
          <div className="buy-sell-exchange-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              {isMobile && (
                <p className="buy-sell-kicker" style={{ margin: "0 0 6px", color: mutedText, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Quick Trade
                </p>
              )}
              <h3 className="chart-header" style={{ color: accentColor, marginBottom: 6 }}>Exchange</h3>
              <p style={{ margin: 0, color: mutedText, fontSize: 14 }}>
                Choose a market pair, select buy or sell, and place a market or limit demo order.
              </p>
            </div>
            <div className="binance-tabs buy-sell-tabs">
              <button
                className={`binance-tab buy ${orderType === "Buy" ? "active" : ""}`}
                onClick={() => setOrderType("Buy")}
                style={{
                  background: orderType === "Buy" ? accentColor : panelBg,
                  color: orderType === "Buy" ? "#fff" : accentColor,
                  border: `1px solid ${accentColor}`,
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
                  background: orderType === "Sell" ? accentColor : panelBg,
                  color: orderType === "Sell" ? "#fff" : accentColor,
                  border: `1px solid ${accentColor}`,
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
              style={{ background: insetBg, padding: "18px", borderRadius: "10px", border: `1px solid ${borderColor}`, marginTop: 16 }}
            >
            <div className={`buy-sell-mobile-summary${isMobile ? " is-mobile" : ""}`}>
              {tradeMeta.map((item) => (
                <div key={item.label} className="buy-sell-mobile-summary-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
            <div className="buy-sell-order-kind-tabs" style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button
                className={`binance-tab ${orderKind === "Market" ? "active" : ""}`}
                onClick={() => setOrderKind("Market")}
                style={{
                  background: orderKind === "Market" ? accentColor : insetBg,
                  color: orderKind === "Market" ? "#fff" : accentColor,
                  border: `1px solid ${accentColor}`,
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
                  background: orderKind === "Limit" ? accentColor : insetBg,
                  color: orderKind === "Limit" ? "#fff" : accentColor,
                  border: `1px solid ${accentColor}`,
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Limit
              </button>
            </div>
            <div className={`buy-sell-form-row${isMobile ? " buy-sell-form-row--card" : ""}`} style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
              <label className="buy-sell-field-label" style={{ minWidth: "80px" }}>
                {isMobile ? mobilePrimaryLabel : (orderType === "Buy" ? "Buy Coin" : "Sell Coin")}
              </label>
              <select className="buy-sell-field-control buy-sell-field-control--compact" value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} style={{ ...compactInputStyle, maxWidth: 140 }}>
                <option>BTC</option>
                <option>ETH</option>
                <option>BNB</option>
                <option>ALGO</option>
              </select>
              <input
                className="buy-sell-field-control"
                type="number"
                value={amountCrypto}
                onChange={(e) => {
                  setLastEdited("crypto");
                  setAmountCrypto(e.target.value);
                  if (Number(effectiveRate) > 0) {
                    setAmountQuote(Number(e.target.value) * Number(effectiveRate));
                  }
                }}
                placeholder={orderType === "Buy" ? "Amount to buy (coin)" : "Amount to sell (coin)"}
                style={compactInputStyle}
              />
            </div>

            {orderKind === "Limit" && (
              <div className={`buy-sell-form-row${isMobile ? " buy-sell-form-row--card" : ""}`} style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
                <label className="buy-sell-field-label" style={{ minWidth: "80px" }}>Price</label>
                <input
                  className="buy-sell-field-control"
                  type="number"
                  value={limitPrice}
                  onChange={(e) => {
                    setIsLimitPriceTouched(true);
                    setLimitPrice(e.target.value);
                    const numericLimit = Number(e.target.value);
                    if (numericLimit > 0) {
                      if (lastEdited === "crypto") {
                        setAmountQuote(Number(amountCrypto) * numericLimit);
                      } else {
                        setAmountCrypto(Number(amountQuote) / numericLimit);
                      }
                    }
                  }}
                  placeholder={`Price in ${toCurrency}`}
                  style={compactInputStyle}
                />
              </div>
            )}

            <div className={`buy-sell-form-row${isMobile ? " buy-sell-form-row--card" : ""}`} style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <label className="buy-sell-field-label" style={{ minWidth: "80px" }}>
                {isMobile ? mobileSecondaryLabel : (orderType === "Buy" ? "Total Cost" : "Total Value")}
              </label>
              <select className="buy-sell-field-control buy-sell-field-control--compact" value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} style={{ ...compactInputStyle, maxWidth: 120 }}>
                <option>USD</option>
                <option>EUR</option>
              </select>
              <div className="buy-sell-field-wrapper">
                <input
                  className="buy-sell-field-control"
                  type="number"
                  value={amountQuote}
                  onChange={(e) => {
                    setLastEdited("quote");
                    setAmountQuote(e.target.value);
                    if (Number(effectiveRate) > 0) {
                      setAmountCrypto(Number(e.target.value) / Number(effectiveRate));
                    }
                  }}
                  placeholder={
                    orderType === "Buy"
                      ? `How much to spend (${toCurrency})`
                      : `Estimated proceeds (${toCurrency})`
                  }
                  style={wideInputStyle}
                />
              </div>
            </div>

            <div className="buy-sell-quick-amount">
              <div className="buy-sell-quick-amount__header">
                <span>Use balance</span>
                <strong>{availableBalance == null ? "--" : `${availableBalance.toFixed(isMobile ? 4 : 6)} ${balanceCurrency}`}</strong>
              </div>
              <div className="buy-sell-quick-amount__buttons">
                {quickAmountOptions.map((percentage) => (
                  <button
                    key={percentage}
                    type="button"
                    className="buy-sell-quick-amount__button"
                    onClick={() => applyQuickAmount(percentage)}
                    disabled={availableBalance == null || availableBalance <= 0 || Number(effectiveRate) <= 0}
                  >
                    {percentage}%
                  </button>
                ))}
              </div>
            </div>

            {statusMessage && (
              <div style={{ marginTop: "12px", color: accentColor }}>
                {statusMessage}
              </div>
            )}

            <div className="buy-sell-submit-row" style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button className="btn-primary" onClick={handleConfirmExchange} disabled={isSubmitting} style={{ background: accentColor, color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer" }}>
                {isSubmitting ? "Submitting..." : `${orderType} ${fromCurrency}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
