import React, { useState } from "react";
import { Link } from "react-router-dom";
import BitcoinChart from "./BitcoinChart";
import logo from "./assets/Copilot_20251008_144326.png";

export default function BuyAndSell() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [fromCurrency, setFromCurrency] = useState("BTC");
  const [toCurrency, setToCurrency] = useState("ETH");
  const [amount, setAmount] = useState(0);

  const handleSwap = () => {
    setFromCurrency((prev) => {
      const old = prev;
      setFromCurrency(toCurrency);
      setToCurrency(old);
      return toCurrency;
    });
  };

  return (
    <div className="crypto-layout">
      {/* Sidebar (same style as main page) */}
      <aside className="crypto-sidebar">
        <img src={logo} alt="Logo" style={{ width: "100%", maxWidth: "150px", marginBottom: "30px" }} />
        <nav className="nav-links">
          {[
            "Pay",
            "Social",
            "More--->",
            "Profile Settings",
            "Crypto",
            "Tools--->",
            "Sign Up",
            "Sign In",
          ].map((item) => {
            if (item === "Profile Settings") {
              return (
                <Link key={item} to="/profile" className="nav-item nav-item-link" style={{ marginTop: "16px", color: "#7f8cff" }}>
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
                      <div className="nav-dropdown-item">Another Assets</div>
                      <div className="nav-dropdown-item">Favorites</div>
                      <div className="nav-dropdown-item">Trending</div>
                      <div className="nav-dropdown-item">Settings</div>
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
                      <Link to="/BitcoinChart" className="nav-dropdown-item">BTC</Link>
                      <div className="nav-dropdown-item">BNB</div>
                      <div className="nav-dropdown-item"></div>
                      <Link to="/withdraw" className="nav-dropdown-item">Withdraw</Link>
                    </div>
                  )}
                </div>
              );
            }
            if (item === "Sign Up") {
              return (
                <Link key={item} to="/sign-up" className="nav-item nav-item-link" style={{ marginTop: "16px", color: "#7f8cff" }}>
                  Sign Up
                </Link>
              );
            }
            if (item === "Sign In") {
              return (
                <Link key={item} to="/sign-in" className="nav-dropdown-item">Sign In</Link>
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
        </nav>
      </aside>

      {/* Main Content */}
      <div className="crypto-main">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="chart-header">Buy & Sell</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ color: "#9aa3ff" }}>Available: <strong>0.000 BTC</strong></div>
            <button className="btn-primary">Deposit</button>
          </div>
        </div>

        <div className="cards-grid" style={{ marginTop: "18px" }}>
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

        <div className="chart-container" style={{ marginTop: "18px" }}>
          <h3 className="chart-header">Market Chart</h3>
          <BitcoinChart />
        </div>

        {/* Buy/Sell Exchange Box */}
        <div className="chart-container" style={{ marginTop: "18px" }}>
          <h3 className="chart-header">Exchange</h3>
          <div style={{ background: "#0d0f1a", padding: "18px", borderRadius: "10px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
              <label style={{ minWidth: "80px" }}>Sell</label>
              <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                <option>BTC</option>
                <option>ETH</option>
                <option>BNB</option>
                <option>ALGO</option>
              </select>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" style={{ flex: 1 }} />
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <button className="btn-primary" onClick={handleSwap} style={{ padding: "8px 12px" }}>Swap</button>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <label style={{ minWidth: "80px" }}>Buy</label>
              <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                <option>ETH</option>
                <option>BTC</option>
                <option>BNB</option>
                <option>ALGO</option>
              </select>
              <div style={{ flex: 1 }}>
                <input type="text" value={amount ? `${(amount * 24.5).toFixed(4)} ${toCurrency}` : ""} readOnly style={{ width: "100%" }} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button className="btn-primary">Confirm Exchange</button>
            </div>
          </div>
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
            <span>{fromCurrency}</span>
            <span>{amount || "0.00"}</span>
          </div>
          <p className="exchange-label">You Get</p>
          <div className="currency-box">
            <span>{toCurrency}</span>
            <span>{amount ? `${(amount * 24.5).toFixed(4)}` : "0.00"}</span>
          </div>
          <button className="btn-primary">Exchange Now</button>
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
          <div className="footer">
            <footer>
              <Link>Instagram</Link>
              <Link>Facebook</Link>
              <Link>Twitter</Link>
            </footer>
          </div>
        </div>
      </aside> */}
    </div>
  );
}
