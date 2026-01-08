

import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import BitcoinChart from "./BitcoinChart";
import BNBChart from "./BNB";
import Chat from "./Chat";
import Profile from "./Profile";
import WithDraw from "./WithdrawPage.jsx";
import BuyAndSell from "./BuyAndSell";

import VerifyIdentityPage from "./VerifyIdentityPage";
import VerificationEmailPage from "./VerificationEmailPage";
import SentSMSToNumberPage from "./SentSMSToNumberPage";

import logo from "./assets/Copilot_20251008_144326.png";
import SignUpPage from "./SignUp.jsx";
import SignInPage from "./Login.jsx";

import "./App.css";
import Admin from "./AdminMainPage.jsx";
import { div } from "framer-motion/client";


function Home() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  return (
    <div className="crypto-layout">
      {/* Sidebar */}
      <aside className="crypto-sidebar">
        {/* <h2 className="brand-title">Name</h2> */}
        <img src={logo} alt="Logo" style={{ width: "100%", maxWidth: "150px", marginBottom: "30px" }} />
        <nav className="nav-links">
          {["Pay", "Social-->", "More--->", "Profile Settings","Crypto--->", "Tools--->", "Temp--->", "Sign Up", "Sign In"].map((item) => {
            if(item === "Profile Settings"){
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
                      <Link to="/chat" className="nav-dropdown-item">Chat</Link>
                      <div className="nav-dropdown-item">News</div>
                      <div className="nav-dropdown-item">Posts</div>
                      <div className="nav-dropdown-item">FAQ</div>                      
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
                      <div className="nav-dropdown-item"></div>
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
      
      {/* Right Sidebar */}
      {/* <aside className="crypto-right-sidebar">
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
      </aside> */}
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

    </Routes>
  );
}