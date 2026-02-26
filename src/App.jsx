

import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import BitcoinChart from "./BitcoinChart";
import BNBChart from "./BNB";
import Profile from "./Profile";
//import Profile from "./Profile";
import WithDraw from "./WithdrawPage.jsx";
import BuyAndSell from "./BuyAndSell";
import BCrypto from "./BCrypto.jsx";
import VerifyIdentityPage from "./VerifyIdentityPage";
import { getKycStatus, getToken } from "./Services/auth";
import VerificationEmailPage from "./VerificationEmailPage";
import SentSMSToNumberPage from "./SentSMSToNumberPage";

import SignUpPage from "./SignUp.jsx";
import SignInPage from "./Login.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import ResetPassword from "./ResetPassword.jsx";
import Sidebar from "./Components/Sidebar";
import Footer from "./Components/Footer";
import CookieConsent from "./Components/CookieConsent";

import "./App.css";
import Admin from "./ADMIN/AdminMainPage.jsx";

import Education from "./Education.jsx";
import HowToSecureWallet from "./HowToSecureWallet.jsx";
import WhatIsBlockchain from "./WhatIsBlockchain.jsx";
import Faq from "./Faq.jsx";
import Support from "./Support.jsx";
import Feedback from "./Feedback.jsx";
import News from "./News.jsx";
import NewsDetail from "./NewsDetail.jsx";
import RugPull from "./RugPull.jsx";
//////// Error page for testing 404 handling
import ErorPage1 from "./ErorPage1.jsx";

const AVAILABLE_CURRENCIES = [
  { code: "BTC", name: "Bitcoin", coinGeckoId: "bitcoin" },
  { code: "ETH", name: "Ethereum", coinGeckoId: "ethereum" },
  { code: "BNB", name: "Binance Coin", coinGeckoId: "binancecoin" },
  { code: "ALGO", name: "Algorand", coinGeckoId: "algorand" },
];

const formatUsd = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: value >= 1 ? 2 : 6,
  }).format(value);
};

function Home({ theme, onToggleTheme }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [livePrices, setLivePrices] = useState(() =>
    AVAILABLE_CURRENCIES.map((currency) => ({
      ...currency,
      price: null,
      previousPrice: null,
      changePct: null,
    }))
  );
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [priceError, setPriceError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadLivePrices = async () => {
      try {
        const ids = AVAILABLE_CURRENCIES.map((currency) => currency.coinGeckoId).join(",");
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch market prices.");
        }

        const payload = await response.json();
        if (!isMounted) {
          return;
        }

        setLivePrices((previousList) =>
          AVAILABLE_CURRENCIES.map((currency) => {
            const previous = previousList.find((item) => item.code === currency.code);
            const nextPrice = Number(payload?.[currency.coinGeckoId]?.usd);
            const previousPrice = previous?.price ?? null;
            const hasComparablePrices =
              typeof previousPrice === "number" &&
              Number.isFinite(previousPrice) &&
              Number.isFinite(nextPrice) &&
              previousPrice > 0;

            return {
              ...currency,
              price: Number.isFinite(nextPrice) ? nextPrice : null,
              previousPrice,
              changePct: hasComparablePrices
                ? ((nextPrice - previousPrice) / previousPrice) * 100
                : null,
            };
          })
        );

        setLastUpdated(new Date());
        setPriceError("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setPriceError(error?.message || "Unable to fetch market prices.");
      } finally {
        if (isMounted) {
          setLoadingPrices(false);
        }
      }
    };

    loadLivePrices();
    const intervalId = setInterval(loadLivePrices, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className={`crypto-layout ${theme === "light" ? "light-mode" : ""}`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}

      <div className="crypto-main">
        <div className="top-bar">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search assets, markets, or news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                const trimmed = searchQuery.trim();
                if (!trimmed) {
                  navigate("/news");
                  return;
                }
                navigate(`/news?q=${encodeURIComponent(trimmed)}`);
              }}
              className="top-search-input"
            />
          </div>

          <button className="theme-toggle-btn" onClick={onToggleTheme} title="Toggle Theme">
            {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          </button>
          <button className="theme-toggle-btn" onClick={onToggleTheme} title="Announcements">
            {'📢'}
          </button>
        </div>
        {/* Bitcoin Live Chart */}
        <div className="chart-container">
          <h3 className="chart-header">Bitcoin Live Chart</h3>
          <BitcoinChart />
        </div>

        {/* Available currencies and real-time prices */}
        <div className="chart-container">
          <h3 className="chart-header">Available Currencies (Live)</h3>
          {loadingPrices ? (
            <p className="balance-title">Loading live prices...</p>
          ) : (
            <>
              <div className="market-list">
                {livePrices.map((currency) => {
                  const isUp = typeof currency.changePct === "number" && currency.changePct >= 0;

                  return (
                    <div key={currency.code} className="market-item">
                      <div>
                        <span className="market-code">{currency.code}</span>
                        <div className="balance-title" style={{ marginTop: "4px" }}>
                          {currency.name}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="market-code">{formatUsd(currency.price)}</div>
                        <div
                          className={
                            typeof currency.changePct === "number"
                              ? isUp
                                ? "rate-up"
                                : "rate-down"
                              : "balance-title"
                          }
                          style={{ fontSize: "13px", marginTop: "4px" }}
                        >
                          {typeof currency.changePct === "number"
                            ? `${isUp ? "+" : ""}${currency.changePct.toFixed(2)}%`
                            : "--"}
                        </div>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
                          <button
                            className="theme-toggle-btn"
                            style={{ minWidth: "64px", minHeight: "34px", padding: "6px 10px" }}
                            onClick={() => navigate(`/buy-sell?action=buy&asset=${currency.code}&quote=USD`)}
                          >
                            Buy
                          </button>
                          <button
                            className="theme-toggle-btn"
                            style={{ minWidth: "64px", minHeight: "34px", padding: "6px 10px" }}
                            onClick={() => navigate(`/buy-sell?action=sell&asset=${currency.code}&quote=USD`)}
                          >
                            Sell
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="balance-title" style={{ marginTop: "14px" }}>
                {priceError
                  ? `Live update issue: ${priceError}`
                  : `Last updated: ${lastUpdated ? lastUpdated.toLocaleTimeString() : "--"} (refresh every 10s)`}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BitcoinChartPage() {
  return (
    <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        <BitcoinChart />
      </div>
    </div>
  );
}

function BNBChartPage() {
  return (
    <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        <BNBChart />
      </div>
    </div>
  );
}
export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const savedTheme = window.localStorage.getItem("app.theme");
    return savedTheme === "light" ? "light" : "dark";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("app.theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <KycGate>
      <div className={`app-shell ${theme === "light" ? "light-mode" : ""}`}>
        <div className="app-shell-content">
        <Routes>
          <Route path="/" element={<Home theme={theme} onToggleTheme={toggleTheme} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/withdraw" element={<WithDraw />} />
          <Route path="/buy-sell" element={<BuyAndSell />} />
          <Route path="/VerifyIdentityPage" element={<VerifyIdentityPage />} />
          <Route path="/VerificationEmailPage" element={<VerificationEmailPage />} />
          <Route path="/SentSMSToNumberPage" element={<SentSMSToNumberPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/BitcoinChart" element={<BitcoinChartPage />} />
          <Route path="/BNBChart" element={<BNBChartPage />} />

          <Route path="/Admin/*" element={<Admin />} />
          <Route path="/BCrypto" element={<BCrypto assets={[]} />} />

          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/education" element={<Education />} />
          <Route path="/education/how-to-secure-your-wallet" element={<HowToSecureWallet />} />
          <Route path="/education/what-is-blockchain" element={<WhatIsBlockchain />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/support" element={<Support />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/rug-pull" element={<RugPull />} />
          ///////////////
          <Route path="*" element={<ErorPage1 />} />
        </Routes>
        </div>
        <Footer />
        <CookieConsent />
      </div>
    </KycGate>
  );
}
function KycGate({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    const allowList = new Set(["/VerifyIdentityPage", "/sign-in", "/sign-up", "/forgot-password", "/reset-password"]);
    if (allowList.has(location.pathname)) {
      return;
    }

    let isActive = true;
    getKycStatus()
      .then((status) => {
        if (!isActive) return;
        if (!status?.verified) {
          navigate("/VerifyIdentityPage", { replace: true });
        }
      })
      .catch(() => {
        if (!isActive) return;
        navigate("/VerifyIdentityPage", { replace: true });
      });

    return () => {
      isActive = false;
    };
  }, [location.pathname, navigate]);

  return children;
}