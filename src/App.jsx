

import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import BitcoinChart from "./BitcoinChart";
import BNBChart from "./BNB";
import Profile from "./Profile";
//import Profile from "./Profile";
import WithDraw from "./WithdrawPage.jsx";
import BuyAndSell from "./BuyAndSell";
import BCrypto from "./BCrypto.jsx";
import VerifyIdentityPage from "./VerifyIdentityPage";
import VerificationEmailPage from "./VerificationEmailPage";
import SentSMSToNumberPage from "./SentSMSToNumberPage";

import SignUpPage from "./SignUp.jsx";
import SignInPage from "./Login.jsx";
import Sidebar from "./Components/Sidebar";

import "./App.css";
import Admin from "./ADMIN/AdminMainPage.jsx";

import Education from "./Education.jsx";
import News from "./News.jsx";
import RugPull from "./RugPull.jsx";
//////// Error page for testing 404 handling
import ErorPage1 from "./ErorPage1.jsx";
function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState("dark");

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
        <div className="footer">
          <footer>
            <Link>Instagram</Link>
            <Link>Facebook</Link>
            <Link>Twitter</Link>
          </footer>
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
      <Route path="/BitcoinChart" element={<BitcoinChartPage />} />
      <Route path="/BNBChart" element={<BNBChartPage />} />

      <Route path="/Admin/*" element={<Admin />} />
      <Route path="/BCrypto" element={<BCrypto assets={[]} />} />

      <Route path="/news" element={<News />} />
      <Route path="/education" element={<Education />} />
      <Route path="/rug-pull" element={<RugPull />} />
      ///////////////
      <Route path="*" element={<ErorPage1 />} />
    </Routes>
  );
}