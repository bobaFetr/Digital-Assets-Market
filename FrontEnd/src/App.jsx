import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import BitcoinChart from "./BitcoinChart";
import BNBChart from "./BNB";
import Profile from "./Profile";
import Wallet from "./Wallet";
//import Profile from "./Profile";
import WithDraw from "./WithdrawPage.jsx";
import BuyAndSell from "./BuyAndSell";
import BCrypto from "./BCrypto.jsx";
import VerifyIdentityPage from "./VerifyIdentityPage";
import { AUTH_BLOCKED_EVENT, getKycStatus, getToken, request, getProfile } from "./Services/Service";
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
  if (pathname.startsWith("/news")) return "News";
  if (pathname.startsWith("/education")) return "Education";
  if (pathname.startsWith("/faq")) return "FAQ";
  if (pathname.startsWith("/support")) return "Support";
  if (pathname.startsWith("/feedback")) return "Feedback";
  if (pathname.startsWith("/rug-pull")) return "Rug Pull";
  return "Menu";
};

function UserBalanceCard() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const token = getToken && getToken();
    if (!token) {
      setError("Not authenticated.");
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
        setError(err.message || "Unable to load balance.");
        setLoading(false);
      });
  }, []);
  if (loading) return <div className="balance-amount" style={{ color: 'var(--text-primary)' }}>Loading...</div>;
  if (error) return <div className="balance-amount" style={{ color: 'var(--error-main)' }}>{error}</div>;
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
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [serverInfo, setServerInfo] = useState(null);
  const navigate = useNavigate();
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
    if (!token) return;

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
          <div className="top-profile" title={profile?.userName || 'Profile'} onClick={() => navigate('/profile')}>
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
            <div className="coin-header"><h4 style={{ color: '#fff' }}>My balance</h4></div>
            <UserBalanceCard />
            <div className="reward-label" style={{ color: accentSoftColor }}>+15%</div>
            <button className="btn-primary" style={{ marginTop: 12, background: accentColor, color: '#fff', border: 'none' }}>See details</button>
          </div>
          <div className="coin-card" style={{ background: panelBg, color: textColor, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)', border: '1px solid var(--glass-border)' }}>
            <div className="coin-header"><h4 style={{ color: textColor }}>Savings account</h4></div>
            <div className="balance-amount" style={{ color: textColor }}>$24,800.45</div>
            <button className="btn-primary" style={{ marginTop: 12, background: panelBg, color: accentColor, border: `1px solid ${accentColor}` }}>View summary</button>
          </div>
          <div className="coin-card" style={{ background: panelBg, color: textColor, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)', border: '1px solid var(--glass-border)' }}>
            <div className="coin-header"><h4 style={{ color: textColor }}>Investment portfolio</h4></div>
            <div className="balance-amount" style={{ color: textColor }}>$70,120.78</div>
            <button className="btn-primary" style={{ marginTop: 12, background: panelBg, color: accentColor, border: `1px solid ${accentColor}` }}>Analyze performance</button>
          </div>
        </div>
        {/* Wallet Section */}
        <div className="cards-grid" style={{ marginBottom: 30 }}>
          <div className="coin-card" style={{ gridColumn: 'span 2', background: panelBg, color: textColor, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)', border: '1px solid var(--glass-border)' }}>
            <div className="coin-header"><h4 style={{ color: textColor }}>My Wallet</h4></div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: 12 }}>
              <div className="currency-box" style={{ background: insetBg, color: accentColor, border: '1px solid var(--glass-border)' }}>USD <span style={{ color: textColor }}>$24,678.00</span></div>
              <div className="currency-box" style={{ background: insetBg, color: accentColor, border: '1px solid var(--glass-border)' }}>EUR <span style={{ color: textColor }}>€28,345.00</span></div>
              <div className="currency-box" style={{ background: insetBg, color: accentColor, border: '1px solid var(--glass-border)' }}>AUD <span style={{ color: textColor }}>$20,517.52</span></div>
              <div className="currency-box" style={{ background: insetBg, color: accentColor, border: '1px solid var(--glass-border)' }}>GBP <span style={{ color: textColor }}>£25,000.00</span></div>
            </div>
            <button className="btn-primary" style={{ marginTop: 12, background: accentColor, color: '#fff', border: 'none' }}>+ Add new</button>
          </div>    
        </div>
        {/* Cash Flow Chart */}
        <div className="chart-container" style={{ margin: "24px 0" }}>
          <BitcoinChart symbol="BTCUSD" />
        </div>
        {/* Recent Activities Table */}
        <div className="chart-container" style={{ background: panelBg, color: textColor, boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)', border: '1px solid var(--glass-border)' }}>
          <div className="chart-header" style={{ color: textColor }}>Recent Activities</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: textColor, background: tableRowBg }}>
              <thead>
                <tr style={{ background: tableHeadBg }}>
                  <th style={{ padding: '10px 16px', color: accentColor }}>Activity</th>
                  <th style={{ padding: '10px 16px', color: accentColor }}>Order</th>
                  <th style={{ padding: '10px 16px', color: accentColor }}>Date</th>
                  <th style={{ padding: '10px 16px', color: accentColor }}>Time</th>
                  <th style={{ padding: '10px 16px', color: accentColor }}>Amount</th>
                  <th style={{ padding: '10px 16px', color: accentColor }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: tableRowBg, borderTop: `1px solid ${tableBorderColor}` }}>
                  <td style={{ padding: '10px 16px' }}>Software License</td>
                  <td style={{ padding: '10px 16px' }}>No.000676</td>
                  <td style={{ padding: '10px 16px' }}>17 Apr, 2026</td>
                  <td style={{ padding: '10px 16px' }}>02:45 PM</td>
                  <td style={{ padding: '10px 16px' }}>$25,500</td>
                  <td style={{ padding: '10px 16px', color: successColor }}>Completed</td>
                </tr>
                <tr style={{ background: tableRowBg, borderTop: `1px solid ${tableBorderColor}` }}>
                  <td style={{ padding: '10px 16px' }}>Deposit</td>
                  <td style={{ padding: '10px 16px' }}>No.000677</td>
                  <td style={{ padding: '10px 16px' }}>18 Apr, 2026</td>
                  <td style={{ padding: '10px 16px' }}>10:15 AM</td>
                  <td style={{ padding: '10px 16px' }}>$10,000</td>
                  <td style={{ padding: '10px 16px', color: accentColor }}>Pending</td>
                </tr>
                <tr style={{ background: tableRowBg, borderTop: `1px solid ${tableBorderColor}` }}>
                  <td style={{ padding: '10px 16px' }}>Withdrawal</td>
                  <td style={{ padding: '10px 16px' }}>No.000678</td>
                  <td style={{ padding: '10px 16px' }}>19 Apr, 2026</td>
                  <td style={{ padding: '10px 16px' }}>04:30 PM</td>
                  <td style={{ padding: '10px 16px' }}>$5,000</td>
                  <td style={{ padding: '10px 16px', color: errorColor }}>Failed</td>
                </tr>
              </tbody>
            </table>
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
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
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
          <Route path="/profile" element={<Profile />} />
          <Route path="/wallets" element={<Wallet />} />
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

          <Route path="/Admin/*" element={<Admin mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />} />
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
