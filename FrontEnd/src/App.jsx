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
import { getKycStatus, getToken, request, getProfile } from "./Services/Service";
import { buildUrl } from "./config/api";
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
  if (loading) return <div className="balance-amount" style={{ color: '#fff' }}>Loading...</div>;
  if (error) return <div className="balance-amount" style={{ color: '#ff8d8d' }}>{error}</div>;
  return <div className="balance-amount" style={{ color: '#fff' }}>${balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>;
}

function Home({ theme, onToggleTheme }) {
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
      <Sidebar />
      <div className="crypto-main">
        <div className="top-bar">
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
          <button className="theme-toggle-btn" onClick={onToggleTheme} title="Toggle Theme">
            {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          </button>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              className="theme-toggle-btn"
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
                  background: '#ff7f50',
                  color: '#fff',
                  borderRadius: '50%',
                  fontSize: 12,
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  border: '2px solid #232323',
                  zIndex: 2
                }}>{unreadNews.length}</span>
              )}
            </button>
            {showNotifications && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 36,
                background: '#232323',
                color: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 8px #181a20',
                minWidth: 320,
                zIndex: 1000,
                padding: 12
              }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: '#ff7f50' }}>Unread News</div>
                {newsError && <div style={{ color: '#ff4d4d', marginBottom: 8 }}>{newsError}</div>}
                {unreadNews.length === 0 && <div style={{ color: '#aaa' }}>No new unread news.</div>}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {unreadNews.map((n) => (
                    <li key={n.newsId} style={{ marginBottom: 8, borderBottom: '1px solid #333', paddingBottom: 6 }}>
                      <a
                        href={`/news/${n.newsId}`}
                        style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}
                        onClick={() => handleMarkNewsRead(n.newsId)}
                      >
                        <span style={{ color: '#ff7f50', marginRight: 6 }}>●</span>
                        {n.title}
                      </a>
                      <div style={{ fontSize: 12, color: '#aaa' }}>{n.publishedAt ? new Date(n.publishedAt).toLocaleString() : ''}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="top-profile" title={profile?.userName || 'Profile'} onClick={() => navigate('/profile')}>
            <img
              src={
                profile?.profilePictureUrl
                  ? (profile.profilePictureUrl.startsWith('data:image/') || /^https?:\/\//i.test(profile.profilePictureUrl)
                      ? profile.profilePictureUrl
                      : profile.profilePictureUrl.startsWith('/')
                      ? buildUrl(profile.profilePictureUrl)
                      : profile.profilePictureUrl)
                  : buildUrl('/OIP.webp')
              }
              alt="Profile"
              onError={(e) => {
                e.currentTarget.src = buildUrl('/OIP.webp');
              }}
              style={{ width: 48, height: 48, objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>
        {/* Most Visited Crypto */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: '#fff', marginBottom: 12 }}>Most visited crypto</h3>
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
                    }} style={{ background: '#181818', color: '#fff', padding: 12, borderRadius: 8, minWidth: 140, cursor: 'pointer' }}>
                  <div style={{ fontWeight: 700 }}>{c.code}</div>
                  <div style={{ fontSize: 12, color: '#aaa' }}>{c.name}</div>
                  <div style={{ marginTop: 8, fontSize: 16 }}>{price !== null ? formatUsd(price) : '--'}</div>
                    {c.code === 'BTC' && serverInfo && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#cdd6ff' }}>
                        {serverInfo.error ? (
                          <div style={{ color: '#ff8d8d' }}>Error: {serverInfo.error}</div>
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
          <div className="coin-card" style={{ background: 'linear-gradient(135deg, #ff7f50 0%, #ff4500 100%)', color: '#fff', boxShadow: '0 4px 16px #ff7f50a0' }}>
            <div className="coin-header"><h4 style={{ color: '#fff' }}>My balance</h4></div>
            <UserBalanceCard />
            <div className="reward-label" style={{ color: '#ffd6b0' }}>+15%</div>
            <button className="btn-primary" style={{ marginTop: 12, background: '#ff7f50', color: '#fff', border: 'none' }}>See details</button>
          </div>
          <div className="coin-card" style={{ background: '#232323', color: '#fff', boxShadow: '0 2px 8px #232323a0' }}>
            <div className="coin-header"><h4 style={{ color: '#fff' }}>Savings account</h4></div>
            <div className="balance-amount" style={{ color: '#fff' }}>$24,800.45</div>
            <button className="btn-primary" style={{ marginTop: 12, background: '#232323', color: '#ff7f50', border: '1px solid #ff7f50' }}>View summary</button>
          </div>
          <div className="coin-card" style={{ background: '#2d2d2d', color: '#fff', boxShadow: '0 2px 8px #2d2d2da0' }}>
            <div className="coin-header"><h4 style={{ color: '#fff' }}>Investment portfolio</h4></div>
            <div className="balance-amount" style={{ color: '#fff' }}>$70,120.78</div>
            <button className="btn-primary" style={{ marginTop: 12, background: '#2d2d2d', color: '#ff7f50', border: '1px solid #ff7f50' }}>Analyze performance</button>
          </div>
        </div>
        {/* Wallet Section */}
        <div className="cards-grid" style={{ marginBottom: 30 }}>
          <div className="coin-card" style={{ gridColumn: 'span 2', background: '#232323', color: '#fff', boxShadow: '0 2px 8px #232323a0' }}>
            <div className="coin-header"><h4 style={{ color: '#fff' }}>My Wallet</h4></div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: 12 }}>
              <div className="currency-box" style={{ background: '#181818', color: '#ff7f50' }}>USD <span style={{ color: '#fff' }}>$24,678.00</span></div>
              <div className="currency-box" style={{ background: '#181818', color: '#ff7f50' }}>EUR <span style={{ color: '#fff' }}>€28,345.00</span></div>
              <div className="currency-box" style={{ background: '#181818', color: '#ff7f50' }}>AUD <span style={{ color: '#fff' }}>$20,517.52</span></div>
              <div className="currency-box" style={{ background: '#181818', color: '#ff7f50' }}>GBP <span style={{ color: '#fff' }}>£25,000.00</span></div>
            </div>
            <button className="btn-primary" style={{ marginTop: 12, background: '#ff7f50', color: '#fff', border: 'none' }}>+ Add new</button>
          </div>    
        </div>
        {/* Cash Flow Chart */}
        <div className="chart-container" style={{ margin: "24px 0" }}>
          <BitcoinChart symbol="BTCUSD" />
        </div>
        {/* Recent Activities Table */}
        <div className="chart-container" style={{ background: '#232323', color: '#fff', boxShadow: '0 2px 8px #232323a0' }}>
          <div className="chart-header" style={{ color: '#fff' }}>Recent Activities</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', background: '#232323' }}>
              <thead>
                <tr style={{ background: '#181818' }}>
                  <th style={{ padding: '10px 16px', color: '#ff7f50' }}>Activity</th>
                  <th style={{ padding: '10px 16px', color: '#ff7f50' }}>Order</th>
                  <th style={{ padding: '10px 16px', color: '#ff7f50' }}>Date</th>
                  <th style={{ padding: '10px 16px', color: '#ff7f50' }}>Time</th>
                  <th style={{ padding: '10px 16px', color: '#ff7f50' }}>Amount</th>
                  <th style={{ padding: '10px 16px', color: '#ff7f50' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: '#232323' }}>
                  <td style={{ padding: '10px 16px' }}>Software License</td>
                  <td style={{ padding: '10px 16px' }}>No.000676</td>
                  <td style={{ padding: '10px 16px' }}>17 Apr, 2026</td>
                  <td style={{ padding: '10px 16px' }}>02:45 PM</td>
                  <td style={{ padding: '10px 16px' }}>$25,500</td>
                  <td style={{ padding: '10px 16px', color: '#4dff88' }}>Completed</td>
                </tr>
                <tr style={{ background: '#232323' }}>
                  <td style={{ padding: '10px 16px' }}>Deposit</td>
                  <td style={{ padding: '10px 16px' }}>No.000677</td>
                  <td style={{ padding: '10px 16px' }}>18 Apr, 2026</td>
                  <td style={{ padding: '10px 16px' }}>10:15 AM</td>
                  <td style={{ padding: '10px 16px' }}>$10,000</td>
                  <td style={{ padding: '10px 16px', color: '#ff7f50' }}>Pending</td>
                </tr>
                <tr style={{ background: '#232323' }}>
                  <td style={{ padding: '10px 16px' }}>Withdrawal</td>
                  <td style={{ padding: '10px 16px' }}>No.000678</td>
                  <td style={{ padding: '10px 16px' }}>19 Apr, 2026</td>
                  <td style={{ padding: '10px 16px' }}>04:30 PM</td>
                  <td style={{ padding: '10px 16px' }}>$5,000</td>
                  <td style={{ padding: '10px 16px', color: '#ff4d4d' }}>Failed</td>
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

    // Identity verification is optional. Query the backend for status but do not force navigation.
    let isActive = true;
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