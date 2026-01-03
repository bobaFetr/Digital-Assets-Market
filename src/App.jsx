

import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import BitcoinChart from "./BitcoinChart";
import Chat from "./Chat";
import Profile from "./Profile";
import WithDraw from "./WithdrawPage.jsx";
import logo from "./assets/Copilot_20251008_144326.png";

function Home() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  return (
    <div className="crypto-layout">
      {/* Sidebar */}
      <aside className="crypto-sidebar">
        {/* <h2 className="brand-title">Name</h2> */}
        <img src={logo} alt="Logo" style={{ width: "100%", maxWidth: "150px", marginBottom: "30px" }} />
        <nav className="nav-links">
          {["Pay", "Social", "More", "Stacking Calculator", "Profile Settings", "Crypto", "Sign Up", "Sign In"].map((item) => {
            if (item === "More") {
              return (
                <div key={item} className="nav-item-dropdown-container">
                  <div
                    className={`nav-item ${activeDropdown === "More" ? "active" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "More" ? null : "More")}
                  >
                    {item}
                  </div>
                  {activeDropdown === "More" && (
                    <div className="nav-dropdown-menu">
                      <div className="nav-dropdown-item">Tutorial for beginners</div>
                      <div className="nav-dropdown-item">Another Assets</div>
                      <div className="nav-dropdown-item">Trending</div>
                      <div className="nav-dropdown-item">Settings</div>
                      <div className="nav-dropdown-item">Help</div>
                      <div className="nav-dropdown-item">Log Out</div>
                    </div>
                  )}
                </div>
              );
            }
            if (item === "Crypto") {
              return (
                <div key={item} className="nav-item-dropdown-container">
                  <div
                    className={`nav-item ${activeDropdown === "Crypto" ? "active" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "Crypto" ? null : "Crypto")}
                  >
                    {item}
                  </div>
                  {activeDropdown === "Crypto" && (
                    <div className="nav-dropdown-menu">
                      <div className="nav-dropdown-item">AI Assistant</div>
                      <div className="nav-dropdown-item">Buy and Sell</div>
                      <div className="nav-dropdown-item">Deposit</div>
                      <Link to="/withdraw" className="nav-dropdown-item">Withdraw</Link>
                    </div>
                  )}
                </div>
              );
            }
            if (item === "Social") {
              return (
                <div key={item} className="nav-item-dropdown-container">
                  <div
                    className={`nav-item ${activeDropdown === "Social" ? "active" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "Social" ? null : "Social")}
                  >
                    {item}
                  </div>
                  {activeDropdown === "Social" && (
                    <div className="nav-dropdown-menu">
                      <div className="nav-dropdown-item">News</div>
                      <div className="nav-dropdown-item">Posts</div>
                      <div className="nav-dropdown-item">FAQ</div>
                      <Link to="/chat" className="nav-dropdown-item">Chat</Link>
                      <Link to="/profile" className="nav-dropdown-item">Profile</Link>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <div key={item} className="nav-item">
                {item}
              </div>
            );
          })}
          <Link to="/chat" className="nav-item nav-item-link" style={{ marginTop: "16px", color: "#7f8cff" }}>
            Chat
          </Link>
          <Link to="/profile" className="nav-item nav-item-link" style={{ marginTop: "16px", color: "#7f8cff" }}>
            Profile
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="crypto-main">
        <h2 className="header-greeting">Good Morning, User</h2>

        {/* Recommended Coins */}
        <div className="cards-grid">
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

      {/* Right Sidebar */}
      <aside className="crypto-right-sidebar">
        <div className="balance-card">
          <div className="balance-title">Total Balance</div>
          <h1 className="balance-amount">$37.4343</h1>
        </div>

        <div className="exchange-section">
          <p className="exchange-label">You Sell</p>
          <div className="currency-box">
            <span>BTC</span>
            <span>0.00</span>
          </div>
          <p className="exchange-label">You Get</p>
          <div className="currency-box">
            <span>BTH</span>
            <span>0.00</span>
          </div>
          <button className="btn-primary">
            Exchange Now
          </button>
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
        </div>
      </aside>
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
    </Routes>
  );
}