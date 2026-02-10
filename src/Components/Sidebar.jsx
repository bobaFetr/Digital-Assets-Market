import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/Gemini_Generated_Image_sb5zszsb5zszsb5z.png";

const NAV_ITEMS = [
  "Pay",
  "Social-->",
  "More--->",
  "Profile Settings",
  "Crypto--->",
  "Tools--->",
  "Temp--->",
  "Sign Up",
  "Sign In",
];

export default function Sidebar() {
  const [activeDropdown, setActiveDropdown] = useState(null);

  return (
    <aside className="crypto-sidebar">
      <img src={logo} alt="Logo" style={{ width: "100%", maxWidth: "150px", marginBottom: "30px" }} />
      <nav className="nav-links">
        {NAV_ITEMS.map((item) => {
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
                    <div className="nav-dropdown-item">Trending</div>
                    <div className="nav-dropdown-item">Favorites</div>
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
      </nav>
    </aside>
  );
}
