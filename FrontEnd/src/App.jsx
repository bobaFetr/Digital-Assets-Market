import React, { useEffect, useState } from "react";
import { Navigate, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import BitcoinChart from "./BitcoinChart";
import BNBChart from "./BNB";
import Profile from "./Profile";
import Wallet from "./Wallet";
import WithDraw from "./WithdrawPage.jsx";
import BuyAndSell from "./BuyAndSell";
import CryptoServerAssetPage from "./CryptoServerAssetPage";
import VerifyIdentityPage from "./VerifyIdentityPage";
import { AUTH_BLOCKED_EVENT, AUTH_STATE_CHANGED_EVENT, getKycStatus, getToken, getUserRoleHint, request, getProfile } from "./Services/Service";
import { buildUrl } from "./config/api";
import { resolveTrustedImageUrl } from "./Security/trustedContent";
import SignUpPage from "./SignUp.jsx";
import SignInPage from "./Login.jsx";
import ResetPassword from "./ResetPassword.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import Sidebar from "./Components/Sidebar";
import Footer from "./Components/Footer";
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
import ErrorPage2 from "./ErrorPage2.jsx";
import ErrorPage3 from "./ErrorPage3.jsx";
const AVAILABLE_CURRENCIES = [{
  code: "BTC",
  name: "Bitcoin",
  coinGeckoId: "bitcoin"
}, {
  code: "ETH",
  name: "Ethereum",
  coinGeckoId: "ethereum"
}, {
  code: "BNB",
  name: "Binance Coin",
  coinGeckoId: "binancecoin"
}, {
  code: "ALGO",
  name: "Algorand",
  coinGeckoId: "algorand"
}];
const formatUsd = value => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: value >= 1 ? 2 : 6
  }).format(value);
};
const getMobileHeaderTitle = pathname => {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/Admin")) return "Admin";
  if (pathname.startsWith("/profile")) return "Profile";
  if (pathname.startsWith("/wallets")) return "Wallets";
  if (pathname.startsWith("/withdraw")) return "Withdraw";
  if (pathname.startsWith("/buy-sell")) return "Buy & Sell";
  if (pathname.startsWith("/VerifyIdentityPage")) return "Verify Identity";
  if (pathname.startsWith("/VerificationEmailPage")) return "Verify Email";
  if (pathname.startsWith("/sign-in")) return "Sign In";
  if (pathname.startsWith("/sign-up")) return "Sign Up";
  if (pathname.startsWith("/forgot-password")) return "Forgot Password";
  if (pathname.startsWith("/reset-password")) return "Reset Password";
  if (pathname.startsWith("/BitcoinChart")) return "BTC Markets";
  if (pathname.startsWith("/BNBChart")) return "BNB Markets";
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
const getRoleFromToken = token => {
  return token ? getUserRoleHint() : "";
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
        Authorization: `Bearer ${token}`
      }
    }).then(wallets => {
      const total = (Array.isArray(wallets) ? wallets : []).reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0);
      setBalance(total);
      setLoading(false);
    }).catch(err => {
      setMessage(err.message || "Unable to load balance.");
      setLoading(false);
    });
  }, []);
  if (loading) return <div className="balance-amount">Loading...</div>;
  if (message) return <div className="balance-amount">{message}</div>;
  return <div className="balance-amount">${balance?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}</div>;
}
function GlobalTopBar({
  theme,
  onToggleTheme,
  setMobileOpen,
  authVersion
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerms, setSearchTerms] = useState([]);
  const [unreadNews, setUnreadNews] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newsError, setNewsError] = useState("");
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = Boolean(getToken());
  useEffect(() => {
    let isMounted = true;
    const loadNews = async () => {
      setNewsError("");
      try {
        const token = getToken && getToken();
        const data = await request(`/api/news`, {
          headers: token ? {
            Authorization: `Bearer ${token}`
          } : undefined
        });
        if (!isMounted) return;
        const items = Array.isArray(data) ? data : [];
        const readIds = JSON.parse(localStorage.getItem("readNewsIds") || "[]");
        setUnreadNews(items.filter(item => item.newsId && !readIds.includes(item.newsId)));
      } catch (err) {
        if (!isMounted) return;
        setNewsError(err?.message || "Failed to load news.");
        setUnreadNews([]);
      }
    };
    loadNews();
    const newsInterval = setInterval(loadNews, 60000);
    return () => {
      isMounted = false;
      clearInterval(newsInterval);
    };
  }, []);
  useEffect(() => {
    let mounted = true;
    const token = getToken && getToken();
    if (!token) {
      setProfile(null);
      return () => {
        mounted = false;
      };
    }
    getProfile().then(nextProfile => {
      if (mounted) setProfile(nextProfile);
    }).catch(() => {
      if (mounted) setProfile(null);
    });
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, authVersion]);
  const submitSearch = event => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      navigate("/news");
      return;
    }
    const query = searchTerms.length > 1 ? searchTerms.join(",") : trimmed;
    navigate(`/news?q=${encodeURIComponent(query)}`);
  };
  const markNewsRead = newsId => {
    const readIds = JSON.parse(localStorage.getItem("readNewsIds") || "[]");
    if (readIds.includes(newsId)) return;
    localStorage.setItem("readNewsIds", JSON.stringify([...readIds, newsId]));
    setUnreadNews(items => items.filter(item => item.newsId !== newsId));
  };
  return <div className="top-bar global-top-bar">
      <form className="top-bar-main" onSubmit={submitSearch}>
        <button type="button" className="mobile-hamburger global-top-bar__menu" aria-label="Toggle navigation" onClick={() => setMobileOpen(value => !value)}>

          Menu
        </button>
        <div className="search-container">
          <span className="search-icon" aria-hidden="true">Search</span>
          <input type="text" placeholder="Search assets, markets, or news..." value={searchQuery} onChange={event => {
          setSearchQuery(event.target.value);
          setSearchTerms(event.target.value.split(",").map(term => term.trim()).filter(Boolean));
        }} className="top-search-input" />

        </div>
      </form>

      <div className="top-bar-actions">
        <button className="theme-toggle-btn theme-toggle-btn--text" onClick={onToggleTheme} title="Toggle Theme">
          {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
        </button>

        <div className="top-notification-wrap">
          <button className="theme-toggle-btn header-icon-button" aria-label="Notifications" aria-expanded={showNotifications} title="Notifications" onClick={() => setShowNotifications(value => !value)}>


            <span role="img" aria-label="notifications">Bell</span>
            {unreadNews.length > 0 && <span className="notification-count">{unreadNews.length}</span>}
          </button>

          {showNotifications && <div className="notification-panel">
              <div className="notification-panel__header">
                <div>Unread News</div>
                <button type="button" className="notification-panel__close" aria-label="Close notifications" onClick={() => setShowNotifications(false)}>

                  Close
                </button>
              </div>
              {newsError && <div>{newsError}</div>}
              {unreadNews.length === 0 && <div>No new unread news.</div>}
              <ul>
                {unreadNews.map(item => <li key={item.newsId}>
                    <a href={`/news/${item.newsId}`} onClick={() => markNewsRead(item.newsId)}>

                      <span>New</span>
                      {item.title}
                    </a>
                    <div>
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleString() : ''}
                    </div>
                  </li>)}
              </ul>
            </div>}
        </div>

        <div className="top-profile" title={profile?.userName || 'Profile'} onClick={() => navigate(isAuthenticated ? '/profile' : '/sign-in')}>

          <img src={resolveTrustedImageUrl(profile?.profilePictureUrl, buildUrl('/default-avatar.webp'), buildUrl)} alt="Profile" onError={event => {
          event.currentTarget.src = buildUrl('/default-avatar.webp');
        }} />

        </div>
      </div>
    </div>;
}
function Home({
  theme,
  onToggleTheme
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerms, setSearchTerms] = useState([]);
  const [news, setNews] = useState([]);
  const [unreadNews, setUnreadNews] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newsError, setNewsError] = useState("");
  const [livePrices, setLivePrices] = useState(() => AVAILABLE_CURRENCIES.map(currency => ({
    ...currency,
    price: null,
    previousPrice: null,
    changePct: null
  })));
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [priceError, setPriceError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [profile, setProfile] = useState(null);
  const [, setWalletPreview] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("BTC");
  const [serverInfo, setServerInfo] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = Boolean(getToken());
  useEffect(() => {
    let isMounted = true;

    // Fetch live prices
    const loadLivePrices = async () => {
      try {
        const ids = AVAILABLE_CURRENCIES.map(currency => currency.coinGeckoId).join(",");
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd`);
        if (!response.ok) {
          throw new Error("Unable to fetch market prices.");
        }
        const payload = await response.json();
        if (!isMounted) return;
        setLivePrices(previousList => AVAILABLE_CURRENCIES.map(currency => {
          const previous = previousList.find(item => item.code === currency.code);
          const nextPrice = Number(payload?.[currency.coinGeckoId]?.usd);
          const previousPrice = previous?.price ?? null;
          const hasComparablePrices = typeof previousPrice === "number" && Number.isFinite(previousPrice) && Number.isFinite(nextPrice) && previousPrice > 0;
          return {
            ...currency,
            price: Number.isFinite(nextPrice) ? nextPrice : null,
            previousPrice,
            changePct: hasComparablePrices ? (nextPrice - previousPrice) / previousPrice * 100 : null
          };
        }));
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
          headers: token ? {
            Authorization: `Bearer ${token}`
          } : undefined
        });
        if (!isMounted) return;
        setNews(Array.isArray(data) ? data : []);
        // Unread logic: store read news IDs in localStorage
        const readIds = JSON.parse(localStorage.getItem("readNewsIds") || "[]");
        const unread = (Array.isArray(data) ? data : []).filter(n => n.newsId && !readIds.includes(n.newsId));
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
        setServerInfo({
          error: err?.message || String(err)
        });
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
    getProfile().then(p => {
      if (!mounted) return;
      setProfile(p);
    }).catch(() => {

      /* ignore */});
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
        Authorization: `Bearer ${token}`
      }
    }).then(wallets => {
      if (!mounted) return;
      setWalletPreview(Array.isArray(wallets) ? wallets.slice(0, 4) : []);
    }).catch(() => {
      if (!mounted) return;
      setWalletPreview([]);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Mark news as read
  const handleMarkNewsRead = newsId => {
    const readIds = JSON.parse(localStorage.getItem("readNewsIds") || "[]");
    if (!readIds.includes(newsId)) {
      const updated = [...readIds, newsId];
      localStorage.setItem("readNewsIds", JSON.stringify(updated));
      setUnreadNews(prev => prev.filter(n => n.newsId !== newsId));
    }
  };
  return <div className={`crypto-layout ${theme === "light" ? "light-mode" : ""}`}>
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
      {mobileSidebarOpen && <div className="mobile-sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} />}
      <div className="crypto-main home-main">
        <div className="top-bar home-top-bar">
          <div className="top-bar-main">
          <button className="mobile-hamburger" aria-label="Toggle navigation" onClick={() => setMobileSidebarOpen(v => !v)}>


            Menu
          </button>
          <div className="search-container">
            <span className="search-icon">Search</span>
            <input type="text" placeholder="Search assets, markets, or news... (separate with commas)" value={searchQuery} onChange={e => {
              setSearchQuery(e.target.value);
              const terms = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
              setSearchTerms(terms);
            }} onKeyDown={event => {
              if (event.key !== "Enter") return;
              const trimmed = searchQuery.trim();
              if (!trimmed) {
                navigate("/news");
                return;
              }
              const multiQ = searchTerms.length > 1 ? searchTerms.join(",") : trimmed;
              navigate(`/news?q=${encodeURIComponent(multiQ)}`);
            }} className="top-search-input" />

          </div>
          </div>
          <div className="top-bar-actions">
          <button className="theme-toggle-btn theme-toggle-btn--text" onClick={onToggleTheme} title="Toggle Theme">
            {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          </button>
          <div className="top-notification-wrap">
            <button className="theme-toggle-btn header-icon-button" aria-label="Notifications" aria-expanded={showNotifications} title="Notifications" onClick={() => setShowNotifications(v => !v)}>


              <span>Notifications</span>
              {unreadNews.length > 0 && <span>















                  {unreadNews.length}</span>}
            </button>
            {showNotifications && <div className="notification-panel">
                <div className="notification-panel__header">
                  <div>Unread News</div>
                  <button type="button" className="notification-panel__close" aria-label="Close notifications" onClick={() => setShowNotifications(false)}>

                    Close
                  </button>
                </div>
                {newsError && <div>{newsError}</div>}
                {unreadNews.length === 0 && <div>No new unread news.</div>}
                <ul>
                  {unreadNews.map(n => <li key={n.newsId}>
                      <a href={`/news/${n.newsId}`} onClick={() => handleMarkNewsRead(n.newsId)}>

                        <span>●</span>
                        {n.title}
                      </a>
                      <div>{n.publishedAt ? new Date(n.publishedAt).toLocaleString() : ''}</div>
                    </li>)}
                </ul>
              </div>}
          </div>
          <div className="top-profile" title={profile?.userName || 'Profile'} onClick={() => navigate(isAuthenticated ? '/profile' : '/sign-in')}>

            <img src={resolveTrustedImageUrl(profile?.profilePictureUrl, buildUrl('/default-avatar.webp'), buildUrl)} alt="Profile" onError={e => {
              e.currentTarget.src = buildUrl('/default-avatar.webp');
            }} />


          </div>
          </div>
        </div>
        <header className="home-hero">
          <div><span className="ui-eyebrow">Market overview</span><h1>See the market.<br />Practice the move.</h1></div>
          <p>Live reference prices, paper balances, and a focused workspace for learning without putting capital at risk.</p>
        </header>

        <section className="home-metrics" aria-label="Account overview">
          <div className="ui-metric"><span className="ui-metric__label">Paper balance</span><UserBalanceCard /><span className="ui-metric__detail">Across internal wallets</span></div>
          <div className="ui-metric"><span className="ui-metric__label">Assets tracked</span><strong className="ui-metric__value">{AVAILABLE_CURRENCIES.length}</strong><span className="ui-metric__detail">Reference USD markets</span></div>
          <div className="ui-metric"><span className="ui-metric__label">Market feed</span><strong className="ui-metric__value">{priceError ? "Offline" : loadingPrices ? "Syncing" : "Live"}</strong><span className="ui-metric__detail">{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Waiting for first update"}</span></div>
        </section>

        <section className="home-market">
          <div className="home-section-heading"><div><span className="ui-eyebrow">Watchlist</span><h2>Market prices</h2></div><button className="btn-ghost" onClick={() => navigate("/BitcoinChart")}>Open markets</button></div>
          {priceError && <div className="ui-notice ui-notice--error">{priceError}</div>}
          <div className="home-market-table" role="region" aria-label="Market prices" tabIndex="0">
          <table>
            <thead><tr><th>Asset</th><th>Price</th><th>Feed change</th><th>Status</th></tr></thead>
            <tbody>{AVAILABLE_CURRENCIES.map(c => {
            const p = livePrices.find(lp => lp.code === c.code);
            const price = p?.price ?? null;
            const change = p?.changePct;
            return <tr key={c.code} className={selectedCurrency === c.code ? "is-selected" : ""} onClick={async () => {
              setSelectedCurrency(c.code);
              if (c.code === 'BTC') {
                try {
                  const data = await request(`/api/binance/btc`);
                  setServerInfo(data);
                } catch (err) {
                  setServerInfo({
                    error: err?.message || String(err)
                  });
                }
              } else {
                setServerInfo(null);
              }
            }}>
                  <td><strong>{c.code}</strong><span>{c.name}</span></td>
                  <td className="numeric">{price !== null ? formatUsd(price) : '--'}</td>
                  <td className={`numeric ${change == null ? "" : change >= 0 ? "positive" : "negative"}`}>{change == null ? "—" : `${change >= 0 ? "+" : ""}${change.toFixed(3)}%`}</td>
                  <td><span className="ui-status ui-status--positive">Live</span></td>
                </tr>;
          })}</tbody>
          </table></div>
        </section>

        <section className="home-workspace-grid">
          <div className="chart-container home-chart">
            <div className="home-section-heading"><div><span className="ui-eyebrow">BTC / USD</span><h2>Price activity</h2></div>{serverInfo && !serverInfo.error ? <span className="ui-status ui-status--positive">Connected</span> : <span className="ui-status">Reference feed</span>}</div>
          <BitcoinChart symbol="BTCUSD" />
          </div>
          <aside className="home-briefing">
            <span className="ui-eyebrow">Briefing</span><h2>Latest notes</h2>
            {newsError ? <p>{newsError}</p> : news.length === 0 ? <div className="ui-empty"><span className="ui-empty__mark">—</span><div><strong>No updates yet</strong><p>Published market notes will appear here.</p></div></div> : <ol>{news.slice(0, 4).map(item => <li key={item.newsId}><a href={`/news/${item.newsId}`} onClick={() => handleMarkNewsRead(item.newsId)}>{item.title}</a><time>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ""}</time></li>)}</ol>}
            <button className="btn-ghost" onClick={() => navigate("/news")}>View newsroom</button>
          </aside>
        </section>

      </div>
    </div>;
}
function BitcoinChartPage() {
  return <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        <BitcoinChart />
      </div>
    </div>;
}
function BNBChartPage() {
  return <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        <BNBChart />
      </div>
    </div>;
}
function RequireAuth({
  children
}) {
  const token = getToken();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/sign-in" replace state={{
      error: "Please sign in to continue.",
      from: location.pathname
    }} />;
  }
  return children;
}
const isProtectedPath = pathname => pathname.startsWith("/profile") || pathname.startsWith("/wallets") || pathname.startsWith("/withdraw") || pathname.startsWith("/buy-sell") || pathname.startsWith("/VerifyIdentityPage") || pathname.startsWith("/Admin");
function RequireAdmin({
  children
}) {
  const token = getToken();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/sign-in" replace state={{
      error: "Please sign in to continue.",
      from: location.pathname
    }} />;
  }
  if (getRoleFromToken(token) !== "Admin") {
    return <Navigate to="/profile" replace state={{
      error: "Admin access only."
    }} />;
  }
  return children;
}
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authVersion, setAuthVersion] = useState(0);
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
    setTheme(prevTheme => prevTheme === "dark" ? "light" : "dark");
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
    const handleBlockedAuth = event => {
      const reason = event?.detail?.reason;
      if (reason !== "banned") {
        return;
      }
      if (location.pathname !== "/sign-in") {
        navigate("/sign-in", {
          replace: true,
          state: {
            error: "Your account has been banned. Access has been disabled."
          }
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
    const handleAuthStateChanged = event => {
      const reason = event?.detail?.reason || "unknown";
      setAuthVersion(value => value + 1);
      if (reason === "unauthorized" && isProtectedPath(location.pathname)) {
        navigate("/sign-in", {
          replace: true,
          state: {
            error: "Your session has expired. Please sign in again."
          }
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
  return <KycGate>
      <div className={`app-shell ${theme === "light" ? "light-mode" : ""}`}>
        <div className="app-shell-content">
          {showGlobalMobileHeader && <div className="global-mobile-header">
              <button className="mobile-hamburger global-mobile-header__menu" aria-label="Toggle navigation" onClick={() => setMobileOpen(v => !v)}>

                Menu
              </button>
              <div className="global-mobile-header__title">{mobileHeaderTitle}</div>
            </div>}
          <button className="mobile-hamburger" aria-label="Toggle navigation" onClick={() => setMobileOpen(v => !v)}>


            Menu
          </button>
          {mobileOpen && <div className="mobile-sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
          {location.pathname !== "/" && <GlobalTopBar theme={theme} onToggleTheme={toggleTheme} setMobileOpen={setMobileOpen} authVersion={authVersion} />}
        <Routes>
          <Route path="/" element={<Home theme={theme} onToggleTheme={toggleTheme} />} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/wallets" element={<RequireAuth><Wallet /></RequireAuth>} />
          <Route path="/withdraw" element={<RequireAuth><WithDraw /></RequireAuth>} />
          <Route path="/buy-sell" element={<RequireAuth><BuyAndSell /></RequireAuth>} />
          <Route path="/VerifyIdentityPage" element={<RequireAuth><VerifyIdentityPage /></RequireAuth>} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/BitcoinChart" element={<BitcoinChartPage />} />
          <Route path="/BNBChart" element={<BNBChartPage />} />
          <Route path="/real-currencies/btcusdt" element={<CryptoServerAssetPage title="BTCUSDT" symbol="BTCUSDT" pricePath="/api/bitcoin" historyPath="/api/bitcoin/history" ordersPath="/api/bitcoin/orders" />} />

          <Route path="/real-currencies/bchusdt" element={<CryptoServerAssetPage title="BCHUSDT" symbol="BCHUSDT" pricePath="/api/bitcoincash" historyPath="/api/bitcoincash/history" ordersPath="/api/bitcoincash/orders" />} />

          <Route path="/Admin/*" element={<RequireAdmin><Admin mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} /></RequireAdmin>} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/education" element={<Education />} />
          <Route path="/education/how-to-secure-your-wallet" element={<HowToSecureWallet />} />
          <Route path="/education/what-is-blockchain" element={<WhatIsBlockchain />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/support" element={<Support />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/rug-pull" element={<RugPull />} />
          <Route path="/service-offline" element={<ErrorPage2 />} />
          <Route path="/session-expired" element={<ErrorPage3 />} />

          <Route path="*" element={<ErorPage1 />} />
        </Routes>
        </div>
        <Footer />
      </div>
    </KycGate>;
}
function KycGate({
  children
}) {
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
    getProfile().catch(error => {
      if (!isActive || !error?.authBlocked) {
        return;
      }
      navigate("/sign-in", {
        replace: true,
        state: {
          error: "Your account has been banned. Access has been disabled."
        }
      });
    });

    // Identity verification is optional. Query the backend for status but do not force navigation.
    getKycStatus().then(status => {
      if (!isActive) return;
      if (!status?.verified) {
        // Non-blocking: you may show a banner or notify the user instead of redirecting.
        console.info("KYC not verified — identity verification is optional.");
      }
    }).catch(() => {
      if (!isActive) return;
      console.info("Unable to determine KYC status — identity verification is optional.");
    });
    return () => {
      isActive = false;
    };
  }, [location.pathname, navigate]);
  return children;
}
