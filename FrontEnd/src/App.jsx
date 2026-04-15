import React, { useEffect, useState } from "react";
import { Navigate, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import BitcoinChart from "./BitcoinChart";
import BNBChart from "./BNB";
import Profile from "./Profile";
import Wallet from "./Wallet";
//import Profile from "./Profile";
import WithDraw from "./WithdrawPage.jsx";
import BuyAndSell from "./BuyAndSell";
import BCrypto from "./BCrypto.jsx";
import CryptoServerAssetPage from "./CryptoServerAssetPage";
import VerifyIdentityPage from "./VerifyIdentityPage";
import { AUTH_BLOCKED_EVENT, AUTH_STATE_CHANGED_EVENT, getKycStatus, getToken, request, getProfile } from "./Services/Service";
import { buildUrl } from "./config/api";
import { resolveTrustedImageUrl } from "./Security/trustedContent";
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

const formatAmount = (value) => {
  const parsedValue = Number(value || 0);
  if (!Number.isFinite(parsedValue)) {
    return "0.00";
  }

  return parsedValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
};

const getMobileHeaderTitle = (pathname) => {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/Admin")) return "Admin";
  if (pathname.startsWith("/profile")) return "Profile";
  if (pathname.startsWith("/wallets")) return "Wallets";
  if (pathname.startsWith("/withdraw")) return "Withdraw";
  if (pathname.startsWith("/buy-sell")) return "Buy & Sell";
  if (pathname.startsWith("/VerifyIdentityPage")) return "Verify Identity";
  if (pathname.startsWith("/VerificationEmailPage")) return "Verify Email";
  if (pathname.startsWith("/SentSMSToNumberPage")) return "SMS Verification";
  if (pathname.startsWith("/sign-in")) return "Sign In";
  if (pathname.startsWith("/sign-up")) return "Sign Up";
  if (pathname.startsWith("/forgot-password")) return "Forgot Password";
  if (pathname.startsWith("/reset-password")) return "Reset Password";
  if (pathname.startsWith("/BitcoinChart")) return "BTC Markets";
  if (pathname.startsWith("/BNBChart")) return "BNB Markets";
  if (pathname.startsWith("/BCrypto")) return "Markets";
  if (pathname.startsWith("/real-currencies/btcusdt")) return "BTCUSDT";
  if (pathname.startsWith("/real-currencies/bchusdt")) return "BCHUSDT";
  if (pathname.startsWith("/news")) return "News";
  if (pathname.startsWith("/education")) return "Education";
  if (pathname.startsWith("/faq")) return "FAQ";
  if (pathname.startsWith("/support")) return "Support";
  if (pathname.startsWith("/feedback")) return "Feedback";
  if (pathname.startsWith("/rug-pull")) return "Rug Pull";
  return "Menu";
};

const getClaimsFromToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
};

const getRoleFromToken = (token) => {
  const claims = getClaimsFromToken(token);
  return (
    claims?.role ||
    claims?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    ""
  );
};

function UserBalanceCard() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const token = getToken && getToken();
    if (!token) {
      setMessage("Sign in to view your balance.");
      setLoading(false);
      return;
    }
    request(`/api/wallets`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((wallets) => {
        const total = (Array.isArray(wallets) ? wallets : []).reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0);
        setBalance(total);
        setLoading(false);
      })
      .catch((err) => {
        setMessage(err.message || "Unable to load balance.");
        setLoading(false);
      });
  }, []);
  if (loading) return <div className="balance-amount" style={{ color: 'var(--text-primary)' }}>Loading...</div>;
  if (message) return <div className="balance-amount" style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{message}</div>;
  return <div className="balance-amount" style={{ color: 'var(--text-primary)' }}>${balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>;
}

function Home({ theme, onToggleTheme }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerms, setSearchTerms] = useState([]);
  const [news, setNews] = useState([]);
  const [unreadNews, setUnreadNews] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newsError, setNewsError] = useState("");
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
  const [profile, setProfile] = useState(null);
  const [walletPreview, setWalletPreview] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [serverInfo, setServerInfo] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = Boolean(getToken());
  const panelBg = "var(--surface-elevated)";
  const insetBg = "var(--surface-inset)";
  const textColor = "var(--text-primary)";
  const mutedTextColor = "var(--text-secondary)";
  const accentColor = "var(--brand-accent)";
  const accentStrongColor = "var(--brand-accent-strong)";
  const accentSoftColor = "var(--brand-accent-soft)";
  const successColor = "var(--success-main)";
  const errorColor = "var(--error-main)";
  const tableHeadBg = "var(--table-head-bg)";
  const tableRowBg = "var(--table-row-bg)";
  const tableBorderColor = "var(--table-border)";

  useEffect(() => {
    let isMounted = true;

    // Fetch live prices
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
        if (!isMounted) return;
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
        if (!isMounted) return;
        setPriceError(error?.message || "Unable to fetch market prices.");
      } finally {
        if (isMounted) setLoadingPrices(false);
      }
    };

    // Fetch news and unread status
    const loadNews = async () => {
      setNewsError("");
      try {
        const token = getToken && getToken();
        const data = await request(`/api/news`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!isMounted) return;
        setNews(Array.isArray(data) ? data : []);
        // Unread logic: store read news IDs in localStorage
        const readIds = JSON.parse(localStorage.getItem("readNewsIds") || "[]");
        const unread = (Array.isArray(data) ? data : []).filter(
          (n) => n.newsId && !readIds.includes(n.newsId)
        );
        setUnreadNews(unread);
      } catch (err) {
        if (!isMounted) return;
        setNewsError(err?.message || "Failed to load news.");
        setNews([]);
        setUnreadNews([]);
      }
    };

    loadLivePrices();
    loadNews();
    const intervalId = setInterval(loadLivePrices, 10000);
    const newsInterval = setInterval(loadNews, 60000); // refresh news every 60s

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      clearInterval(newsInterval);
    };
  }, []);

  // Poll server endpoint for BTC data so it's visible on the main page
  useEffect(() => {
    let mounted = true;
    const fetchServerInfo = async () => {
      try {
        const data = await request(`/api/binance/btc`);
        if (!mounted) return;
        setServerInfo(data);
      } catch (err) {
        if (!mounted) return;
        setServerInfo({ error: err?.message || String(err) });
      }
    };

    fetchServerInfo();
    const id = setInterval(fetchServerInfo, 10000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const token = getToken && getToken();
    if (!token) {
      setProfile(null);
      return;
    }

    getProfile()
      .then((p) => {
        if (!mounted) return;
        setProfile(p);
      })
      .catch(() => {
        /* ignore */
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const token = getToken && getToken();
    if (!token) {
      setWalletPreview([]);
      return;
    }

    request(`/api/wallets`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((wallets) => {
        if (!mounted) return;
        setWalletPreview(Array.isArray(wallets) ? wallets.slice(0, 4) : []);
      })
      .catch(() => {
        if (!mounted) return;
        setWalletPreview([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Mark news as read
  const handleMarkNewsRead = (newsId) => {
    const readIds = JSON.parse(localStorage.getItem("readNewsIds") || "[]");
    if (!readIds.includes(newsId)) {
      const updated = [...readIds, newsId];
      localStorage.setItem("readNewsIds", JSON.stringify(updated));
      setUnreadNews((prev) => prev.filter((n) => n.newsId !== newsId));
    }
  };

  return (
    <div className={`crypto-layout ${theme === "light" ? "light-mode" : ""}`}>
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
      {mobileSidebarOpen && (
        <div className="mobile-sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} />
      )}
      <div className="crypto-main">
        <div className="top-bar">
          <div className="top-bar-main">
          <button
            className="mobile-hamburger"
            aria-label="Toggle navigation"
            onClick={() => setMobileSidebarOpen((v) => !v)}
            style={{ marginRight: 8 }}
          >
            ☰
          </button>
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search assets, markets, or news... (separate with commas)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                const terms = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                setSearchTerms(terms);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                const trimmed = searchQuery.trim();
                if (!trimmed) {
                  navigate("/news");
                  return;
                }
                const multiQ = searchTerms.length > 1 ? searchTerms.join(",") : trimmed;
                navigate(`/news?q=${encodeURIComponent(multiQ)}`);
              }}
              className="top-search-input"
            />
          </div>
          </div>
          <div className="top-bar-actions">
          <button className="theme-toggle-btn theme-toggle-btn--text" onClick={onToggleTheme} title="Toggle Theme">
            {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          </button>
          <div className="top-notification-wrap">
            <button
              className="theme-toggle-btn header-icon-button"
              aria-label="Notifications"
              aria-expanded={showNotifications}
              title="Notifications"
              onClick={() => setShowNotifications((v) => !v)}
              style={{ position: 'relative' }}
            >
              <span role="img" aria-label="notifications">🔔</span>
              {unreadNews.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: accentColor,
                  color: '#fff',
                  borderRadius: '50%',
                  fontSize: 12,
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  border: `2px solid ${panelBg}`,
                  zIndex: 2
                }}>{unreadNews.length}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notification-panel">
                <div className="notification-panel__header">
                  <div style={{ fontWeight: 700, color: accentColor }}>Unread News</div>
                  <button
                    type="button"
                    className="notification-panel__close"
                    aria-label="Close notifications"
                    onClick={() => setShowNotifications(false)}
                  >
                    Close
                  </button>
                </div>
                {newsError && <div style={{ color: errorColor, marginBottom: 8 }}>{newsError}</div>}
                {unreadNews.length === 0 && <div style={{ color: mutedTextColor }}>No new unread news.</div>}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {unreadNews.map((n) => (
                    <li key={n.newsId} style={{ marginBottom: 8, borderBottom: `1px solid ${tableBorderColor}`, paddingBottom: 6 }}>
                      <a
                        href={`/news/${n.newsId}`}
                        style={{ color: textColor, textDecoration: 'none', fontWeight: 600 }}
                        onClick={() => handleMarkNewsRead(n.newsId)}
                      >
                        <span style={{ color: accentColor, marginRight: 6 }}>●</span>
                        {n.title}
                      </a>
                      <div style={{ fontSize: 12, color: mutedTextColor }}>{n.publishedAt ? new Date(n.publishedAt).toLocaleString() : ''}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div
            className="top-profile"
            title={profile?.userName || 'Profile'}
            onClick={() => navigate(isAuthenticated ? '/profile' : '/sign-in')}
          >
            <img
              src={
                resolveTrustedImageUrl(profile?.profilePictureUrl, buildUrl('/OIP.webp'), buildUrl)
              }
              alt="Profile"
              onError={(e) => {
                e.currentTarget.src = buildUrl('/OIP.webp');
              }}
              style={{ width: 48, height: 48, objectFit: 'cover', display: 'block' }}
            />
          </div>
          </div>
        </div>
        {/* Most Visited Crypto */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: textColor, marginBottom: 12 }}>Most visited crypto</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {AVAILABLE_CURRENCIES.slice(0, 3).map((c) => {
              const p = livePrices.find((lp) => lp.code === c.code);
              const price = p?.price ?? null;
              return (
                  <div key={c.code} onClick={async () => {
                      setSelectedCurrency(c.code);
                      if (c.code === 'BTC') {
                        try {
                          const data = await request(`/api/binance/btc`);
                          setServerInfo(data);
                        } catch (err) {
                          setServerInfo({ error: err?.message || String(err) });
                        }
                      } else {
                        setServerInfo(null);
                      }
                    }} style={{ background: insetBg, color: textColor, padding: 12, borderRadius: 8, minWidth: 140, cursor: 'pointer', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontWeight: 700 }}>{c.code}</div>
                  <div style={{ fontSize: 12, color: mutedTextColor }}>{c.name}</div>
                  <div style={{ marginTop: 8, fontSize: 16 }}>{price !== null ? formatUsd(price) : '--'}</div>
                    {c.code === 'BTC' && serverInfo && (
                      <div style={{ marginTop: 8, fontSize: 12, color: mutedTextColor }}>
                        {serverInfo.error ? (
                          <div style={{ color: errorColor }}>Error: {serverInfo.error}</div>
                        ) : (
                          <div>
                            <div>Last: {serverInfo.lastPrice}</div>
                            <div>24h Change: {serverInfo.priceChangePercent}%</div>
                            <div>High: {serverInfo.highPrice}</div>
                            <div>Low: {serverInfo.lowPrice}</div>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Dashboard Overview Cards */}
        <div className="cards-grid" style={{ marginBottom: 30 }}>
          <div className="coin-card" style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentStrongColor} 100%)`, color: '#fff', boxShadow: '0 4px 16px rgba(255, 127, 80, 0.35)' }}>
            <div className="coin-header"><h4 style={{ color: '#fff' }}>{isAuthenticated ? "My balance" : "Digital Asset Marketplace"}</h4></div>
            {isAuthenticated ? (
              <>
                <UserBalanceCard />
                <div className="reward-label" style={{ color: accentSoftColor }}>Internal demo wallet</div>
                <button
                  className="btn-primary"
                  style={{ marginTop: 12, background: accentColor, color: '#fff', border: 'none' }}
                  onClick={() => navigate("/wallets")}
                >
                  Open wallets
                </button>
              </>
            ) : (
              <>
                <div className="balance-amount" style={{ color: "#fff", fontSize: 24, lineHeight: 1.35 }}>
                  Learn, fund, and trade digital assets in a simplified demo platform.
                </div>
                <div className="reward-label" style={{ color: accentSoftColor }}>School diploma prototype</div>
                <button
                  className="btn-primary"
                  style={{ marginTop: 12, background: accentColor, color: '#fff', border: 'none' }}
                  onClick={() => navigate("/sign-up")}
                >
                  Create demo account
                </button>
              </>
            )}
          </div>
          <div className="coin-card" style={{ background: panelBg, color: textColor, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)', border: '1px solid var(--glass-border)' }}>
            <div className="coin-header"><h4 style={{ color: textColor }}>{isAuthenticated ? "Trading demo" : "Public information"}</h4></div>
            <div className="balance-amount" style={{ color: textColor, fontSize: 22 }}>
              {isAuthenticated ? "Buy and sell with simulated platform balances." : "Browse news, FAQ, tutorials, and live market visuals without signing in."}
            </div>
            <button
              className="btn-primary"
              style={{ marginTop: 12, background: panelBg, color: accentColor, border: `1px solid ${accentColor}` }}
              onClick={() => navigate(isAuthenticated ? "/buy-sell" : "/news")}
            >
              {isAuthenticated ? "Open buy / sell" : "Explore content"}
            </button>
          </div>
          <div className="coin-card" style={{ background: panelBg, color: textColor, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)', border: '1px solid var(--glass-border)' }}>
            <div className="coin-header"><h4 style={{ color: textColor }}>{isAuthenticated ? "Identity check" : "Account access"}</h4></div>
            <div className="balance-amount" style={{ color: textColor, fontSize: 22 }}>
              {isAuthenticated ? "Upload a document image to simulate identity verification." : "Sign in to access your personal profile, wallets, and transactions."}
            </div>
            <button
              className="btn-primary"
              style={{ marginTop: 12, background: panelBg, color: accentColor, border: `1px solid ${accentColor}` }}
              onClick={() => navigate(isAuthenticated ? "/VerifyIdentityPage" : "/sign-in")}
            >
              {isAuthenticated ? "Open verification" : "Sign in"}
            </button>
          </div>
        </div>
        {/* Wallet Section */}
        <div className="cards-grid" style={{ marginBottom: 30 }}>
          <div className="coin-card" style={{ gridColumn: 'span 2', background: panelBg, color: textColor, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)', border: '1px solid var(--glass-border)' }}>
            <div className="coin-header"><h4 style={{ color: textColor }}>{isAuthenticated ? "Wallet preview" : "How the demo works"}</h4></div>
            <>
              {isAuthenticated ? (
                <>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: 12 }}>
                    {walletPreview.length > 0 ? (
                      walletPreview.map((wallet) => (
                        <div
                          key={wallet.walletId}
                          className="currency-box"
                          style={{ background: insetBg, color: accentColor, border: '1px solid var(--glass-border)' }}
                        >
                          {wallet.currency} <span style={{ color: textColor }}>{formatAmount(Number(wallet.balance || 0))}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: mutedTextColor }}>Your wallets will appear here after sign in.</div>
                    )}
                  </div>
                  <button
                    className="btn-primary"
                    style={{ marginTop: 12, background: accentColor, color: '#fff', border: 'none' }}
                    onClick={() => navigate("/wallets")}
                  >
                    Open wallet page
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                    <div style={{ padding: 12, borderRadius: 12, background: insetBg, border: '1px solid var(--glass-border)' }}>
                      1. Create an account and upload an ID image to simulate identity data.
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: insetBg, border: '1px solid var(--glass-border)' }}>
                      2. Fund your internal wallet with a demo card deposit.
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: insetBg, border: '1px solid var(--glass-border)' }}>
                      3. Buy or sell digital assets and review the recorded transactions.
                    </div>
                  </div>
                  <button
                    className="btn-primary"
                    style={{ marginTop: 12, background: accentColor, color: '#fff', border: 'none' }}
                    onClick={() => navigate("/sign-up")}
                  >
                    Start the demo
                  </button>
                </>
              )}
              {/*
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: 12 }}>
                {walletPreview.length > 0 ? (
              <div className="currency-box" style={{ background: insetBg, color: accentColor, border: '1px solid var(--glass-border)' }}>EUR <span style={{ color: textColor }}>€28,345.00</span></div>
                  walletPreview.map((wallet) => (
              <div className="currency-box" style={{ background: insetBg, color: accentColor, border: '1px solid var(--glass-border)' }}>GBP <span style={{ color: textColor }}>£25,000.00</span></div>
            </div>
              */}
            </>
        </div>
        </div>
        {/* Cash Flow Chart */}
        <div className="chart-container" style={{ margin: "24px 0" }}>
          <BitcoinChart symbol="BTCUSD" />
        </div>
        <div className="chart-container" style={{ background: panelBg, color: textColor, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)', border: '1px solid var(--glass-border)' }}>
          <div className="chart-header" style={{ color: textColor }}>Demo User Flow</div>
          <div className="section-grid section-grid--two">
            <div className="section-card" style={{ background: insetBg, border: '1px solid var(--glass-border)', boxShadow: 'none', padding: 18 }}>
              <h4 style={{ margin: 0, color: accentColor }}>1. Public Area</h4>
              <p style={{ margin: '8px 0 0', color: mutedTextColor }}>Guests can browse markets, news, FAQ, and educational content before creating an account.</p>
            </div>
            <div className="section-card" style={{ background: insetBg, border: '1px solid var(--glass-border)', boxShadow: 'none', padding: 18 }}>
              <h4 style={{ margin: 0, color: accentColor }}>2. Account and Identity</h4>
              <p style={{ margin: '8px 0 0', color: mutedTextColor }}>Registered users can sign in, manage profile details, and upload an ID image to simulate verification.</p>
            </div>
            <div className="section-card" style={{ background: insetBg, border: '1px solid var(--glass-border)', boxShadow: 'none', padding: 18 }}>
              <h4 style={{ margin: 0, color: accentColor }}>3. Wallet Funding</h4>
              <p style={{ margin: '8px 0 0', color: mutedTextColor }}>Card deposits are simulated and increase the user's internal USD or EUR platform wallet.</p>
            </div>
            <div className="section-card" style={{ background: insetBg, border: '1px solid var(--glass-border)', boxShadow: 'none', padding: 18 }}>
              <h4 style={{ margin: 0, color: accentColor }}>4. Trading Simulation</h4>
              <p style={{ margin: '8px 0 0', color: mutedTextColor }}>Buy and sell actions update internal balances and record transactions without using a real blockchain.</p>
            </div>
          </div>
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

function RequireAuth({ children }) {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/sign-in"
        replace
        state={{ error: "Please sign in to continue.", from: location.pathname }}
      />
    );
  }

  return children;
}

const isProtectedPath = (pathname) =>
  pathname.startsWith("/profile") ||
  pathname.startsWith("/wallets") ||
  pathname.startsWith("/withdraw") ||
  pathname.startsWith("/buy-sell") ||
  pathname.startsWith("/VerifyIdentityPage") ||
  pathname.startsWith("/Admin");

function RequireAdmin({ children }) {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/sign-in"
        replace
        state={{ error: "Please sign in to continue.", from: location.pathname }}
      />
    );
  }

  if (getRoleFromToken(token) !== "Admin") {
    return <Navigate to="/profile" replace state={{ error: "Admin access only." }} />;
  }

  return children;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setAuthVersion] = useState(0);
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

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const rootElement = document.documentElement;
    const bodyElement = document.body;
    const isLightTheme = theme === "light";

    rootElement.classList.toggle("light-mode", isLightTheme);
    bodyElement.classList.toggle("light-mode", isLightTheme);
    rootElement.style.colorScheme = isLightTheme ? "light" : "dark";

    return () => {
      rootElement.classList.remove("light-mode");
      bodyElement.classList.remove("light-mode");
      rootElement.style.colorScheme = "";
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.classList.toggle("sidebar-open", mobileOpen);
    return () => {
      document.body.classList.remove("sidebar-open");
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleBlockedAuth = (event) => {
      const reason = event?.detail?.reason;
      if (reason !== "banned") {
        return;
      }

      if (location.pathname !== "/sign-in") {
        navigate("/sign-in", {
          replace: true,
          state: { error: "Your account has been banned. Access has been disabled." },
        });
      }
    };

    window.addEventListener(AUTH_BLOCKED_EVENT, handleBlockedAuth);
    return () => {
      window.removeEventListener(AUTH_BLOCKED_EVENT, handleBlockedAuth);
    };
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleAuthStateChanged = (event) => {
      const reason = event?.detail?.reason || "unknown";
      setAuthVersion((value) => value + 1);

      if (reason === "unauthorized" && isProtectedPath(location.pathname)) {
        navigate("/sign-in", {
          replace: true,
          state: { error: "Your session has expired. Please sign in again." },
        });
      }
    };

    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
    return () => {
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
    };
  }, [location.pathname, navigate]);

  const showGlobalMobileHeader = location.pathname !== "/" && !location.pathname.startsWith("/Admin");
  const mobileHeaderTitle = getMobileHeaderTitle(location.pathname);

  return (
    <KycGate>
      <div className={`app-shell ${theme === "light" ? "light-mode" : ""}`}>
        <div className="app-shell-content">
          {showGlobalMobileHeader && (
            <div className="global-mobile-header">
              <button
                className="mobile-hamburger global-mobile-header__menu"
                aria-label="Toggle navigation"
                onClick={() => setMobileOpen((v) => !v)}
              >
                ☰
              </button>
              <div className="global-mobile-header__title">{mobileHeaderTitle}</div>
            </div>
          )}
          <button
            className="mobile-hamburger"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((v) => !v)}
            style={{ position: 'fixed', top: 12, left: 12, zIndex: 1300 }}
          >
            ☰
          </button>
          {mobileOpen && (
            <div className="mobile-sidebar-backdrop" onClick={() => setMobileOpen(false)} />
          )}
        <Routes>
          <Route path="/" element={<Home theme={theme} onToggleTheme={toggleTheme} />} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/wallets" element={<RequireAuth><Wallet /></RequireAuth>} />
          <Route path="/withdraw" element={<RequireAuth><WithDraw /></RequireAuth>} />
          <Route path="/buy-sell" element={<RequireAuth><BuyAndSell /></RequireAuth>} />
          <Route path="/VerifyIdentityPage" element={<RequireAuth><VerifyIdentityPage /></RequireAuth>} />
          <Route path="/VerificationEmailPage" element={<VerificationEmailPage />} />
          <Route path="/SentSMSToNumberPage" element={<SentSMSToNumberPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/BitcoinChart" element={<BitcoinChartPage />} />
          <Route path="/BNBChart" element={<BNBChartPage />} />
          <Route
            path="/real-currencies/btcusdt"
            element={
              <CryptoServerAssetPage
                title="BTCUSDT"
                symbol="BTCUSDT"
                pricePath="/api/bitcoin"
                historyPath="/api/bitcoin/history"
                ordersPath="/api/bitcoin/orders"
              />
            }
          />
          <Route
            path="/real-currencies/bchusdt"
            element={
              <CryptoServerAssetPage
                title="BCHUSDT"
                symbol="BCHUSDT"
                pricePath="/api/bitcoincash"
                historyPath="/api/bitcoincash/history"
                ordersPath="/api/bitcoincash/orders"
              />
            }
          />
          <Route path="/Admin/*" element={<RequireAdmin><Admin mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} /></RequireAdmin>} />
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

    getProfile()
      .catch((error) => {
        if (!isActive || !error?.authBlocked) {
          return;
        }

        navigate("/sign-in", {
          replace: true,
          state: { error: "Your account has been banned. Access has been disabled." },
        });
      });

    // Identity verification is optional. Query the backend for status but do not force navigation.
    getKycStatus()
      .then((status) => {
        if (!isActive) return;
        if (!status?.verified) {
          // Non-blocking: you may show a banner or notify the user instead of redirecting.
          console.info("KYC not verified — identity verification is optional.");
        }
      })
      .catch(() => {
        if (!isActive) return;
        console.info("Unable to determine KYC status — identity verification is optional.");
      });

    return () => {
      isActive = false;
    };
  }, [location.pathname, navigate]);

  return children;
}
