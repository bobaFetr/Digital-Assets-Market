

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
function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState("dark");
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };
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

          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          </button>
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Announcements">
            {'📢'}
          </button>
        </div>
        {/* Bitcoin Live Chart */}
        <div className="chart-container">
          <h3 className="chart-header">Bitcoin Live Chart</h3>
          <BitcoinChart />
        </div>

        {/* Bitcoin Cash Graph */}
        <div className="chart-container">
          <h3 className="chart-header">Bitcoin Cash (BTH)</h3>
          <h1 style={{ color: "var(--accent-green)", margin: "10px 0" }}>$23.7475</h1>
          <div style={{ height: "280px", background: "#0d0f1a", marginTop: "20px", borderRadius: "10px" }}></div>
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
  return (
    <KycGate>
      <div className="app-shell">
        <div className="app-shell-content">
        <Routes>
          <Route path="/" element={<Home />} />
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