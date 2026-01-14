

import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import BitcoinChart from "./BitcoinChart";
import BNBChart from "./BNB";
import Chat from "./Chat";
import Profile from "./Profile";
import WithDraw from "./WithdrawPage.jsx";
import BuyAndSell from "./BuyAndSell";
import BCrypto from "./BCrypto.jsx";
import VerifyIdentityPage from "./VerifyIdentityPage";
import VerificationEmailPage from "./VerificationEmailPage";
import SentSMSToNumberPage from "./SentSMSToNumberPage";

import logo from "./assets/Gemini_Generated_Image_sb5zszsb5zszsb5z.png";
import SignUpPage from "./SignUp.jsx";
import SignInPage from "./Login.jsx";

import "./App.css";
import Admin from "./AdminMainPage.jsx";

import Education from "./Education.jsx";
import News from "./News.jsx";
import Posts from "./Posts.jsx";
import FAQ from "./FAQ.jsx";
import RugPull from "./RugPull.jsx";

function Home() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };
  return (
    <div className={`crypto-layout ${theme === "light" ? "light-mode" : ""}`}>
      {/* Sidebar */}
      <aside className="crypto-sidebar">
        {/* <h2 className="brand-title">Name</h2> */}
        <img src={logo} alt="Logo" style={{ width: "100%", maxWidth: "150px", marginBottom: "30px" }} />
        <nav className="nav-links">
          {["Pay", "Social-->", "More--->", "Profile Settings", "Crypto--->", "Tools--->", "Temp--->", "Sign Up", "Sign In"].map((item) => {
            if (item === "Profile Settings") {
              return (
                <Link to="/profile" className="nav-item nav-item-link" style={{ marginTop: "16px", color: "#7f8cff" }}>
                  Profile Settings
                </Link>
              );
            }
            if (item === "More--->") {
              return (
                <div key={item} className="nav-item-dropdown-container">
                  <div
                    className={`nav-item ${activeDropdown === "More--->" ? "active" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "More--->" ? null : "More--->")}
                  >
                    {item}
                  </div>
                  {activeDropdown === "More--->" && (
                    <div className="nav-dropdown-menu">
                      <div className="nav-dropdown-item">Tutorial for beginners</div>
                      <div className="nav-dropdown-item">Crypto Education</div>
                      <div className="nav-dropdown-item">Trending</div>
                      <div className="nav-dropdown-item">Favorites</div>
                      <div className="nav-dropdown-item">Another Assets</div>
                      {/* <div className="nav-dropdown-item">Settings</div> */}
                      <div className="nav-dropdown-item">Help</div>
                    </div>
                  )}
                </div>
              );
            }
            if (item === "Tools--->") {
              return (
                <div key={item} className="nav-item-dropdown-container">
                  <div
                    className={`nav-item ${activeDropdown === "Tools--->" ? "active" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "Tools--->" ? null : "Tools--->")}
                  >
                    {item}
                  </div>
                  {activeDropdown === "Tools--->" && (
                    <div className="nav-dropdown-menu">
                      <div className="nav-dropdown-item">AI Assistant</div>
                      <Link to="/buy-sell" className="nav-dropdown-item">Buy and Sell</Link>
                      <div className="nav-dropdown-item">Deposit</div>
                      <Link to="/withdraw" className="nav-dropdown-item">Withdraw</Link>
                    </div>
                  )}
                </div>
              );
            }
            if (item === "Social-->") {
              return (
                <div key={item} className="nav-item-dropdown-container">
                  <div
                    className={`nav-item ${activeDropdown === "Social-->" ? "active" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "Social-->" ? null : "Social-->")}
                  >
                    {item}
                  </div>
                  {activeDropdown === "Social-->" && (
                    <div className="nav-dropdown-menu">
                      <Link to="/news" className="nav-dropdown-item">News</Link>
                      <Link to="/posts" className="nav-dropdown-item">Posts</Link>
                      <Link to="/education" className="nav-dropdown-item">Education</Link>
                      <Link to="/rug-pull" className="nav-dropdown-item">Rug Pull</Link>
                      <Link to="/faq" className="nav-dropdown-item">FAQ</Link>
                    </div>
                  )}
                </div>
              );
            }
            if (item === "Crypto--->") {
              return (
                <div key={item} className="nav-item-dropdown-container">
                  <div
                    className={`nav-item ${activeDropdown === "Crypto--->" ? "active" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "Crypto--->" ? null : "Crypto--->")}
                  >
                    {item}
                  </div>
                  {activeDropdown === "Crypto--->" && (
                    <div className="nav-dropdown-menu">
                      <Link to="/BitcoinChart" className="nav-dropdown-item">BTC</Link>
                      <Link to="/BNBChart" className="nav-dropdown-item">BNB</Link>
                      <Link to="/BCrypto" className="nav-dropdown-item">BCrypto</Link>
                      <Link to="/withdraw" className="nav-dropdown-item"></Link>
                    </div>
                  )}
                </div>
              );
            }
            if (item === "Temp--->") {
              return (
                <div key={item} className="nav-item-dropdown-container">
                  <div
                    className={`nav-item ${activeDropdown === "Temp--->" ? "active" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "Temp--->" ? null : "Temp--->")}
                  >
                    {item}
                  </div>
                  {activeDropdown === "Temp--->" && (
                    <div className="nav-dropdown-menu">
                      <Link to="/VerifyIdentityPage" className="nav-dropdown-item">VerifyIdentity</Link>
                      <Link to="/VerificationEmailPage" className="nav-dropdown-item">Verify Email</Link>
                      <Link to="/SentSMSToNumberPage" className="nav-dropdown-item">Sent SMS</Link>
                      <Link to="/Admin" className="nav-dropdown-item">Admin</Link>
                    </div>
                  )}
                </div>
              );
            }
            if (item === "Sign Up") {
              return (
                <Link to="/sign-up" className="nav-item nav-item-link" style={{ marginTop: "16px", color: "#7f8cff" }}>
                  Sign Up
                </Link>
              );
            }
            if (item === "Sign In") {
              return (
                <Link to="/sign-in" className="nav-dropdown-item">Sign In</Link>
              );
            }
          })}
        </nav>
      </aside>

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
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        {/* Recommended Coins */}
        {/* <div className="cards-grid">
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
        </div> */}

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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/withdraw" element={<WithDraw />} />
      <Route path="/buy-sell" element={<BuyAndSell />} />
      <Route path="/VerifyIdentityPage" element={<VerifyIdentityPage />} />
      <Route path="/VerificationEmailPage" element={<VerificationEmailPage />} />
      <Route path="/SentSMSToNumberPage" element={<SentSMSToNumberPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/BitcoinChart" element={<BitcoinChart />} />
      <Route path="/BNBChart" element={<BNBChart />} />

      <Route path="/Admin/*" element={<Admin />} />
      {/* <Route path="/BCrypto/*" element={<BCrypto />} /> */}
      <Route path="/BCrypto" element={<BCrypto assets={[]} />} />

      <Route path="/news" element={<News />} />
      <Route path="/posts" element={<Posts />} />
      <Route path="/education" element={<Education />} />
      <Route path="/rug-pull" element={<RugPull />} />
      <Route path="/faq" element={<FAQ />} />

    </Routes>
  );
}