import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/Gemini_Generated_Image_sb5zszsb5zszsb5z.png";
import { getToken } from "../Services/auth";

const NAV_ITEMS = [
//   "Pay",
  "Social",
  "More",
  "Profile Settings",
  "Crypto",
  "Tools",
  "Temp",
  "Sign Up",
  "Sign In",
];

export default function Sidebar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const token = getToken();
  const claims = useMemo(() => {
    if (!token) return null;
    try {
      const payload = token.split(".")[1];
      if (!payload) return null;
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(normalized));
    } catch {
      return null;
    }
  }, [token]);
  const isAuthenticated = Boolean(token);
  const isAdmin =
    claims?.role === "Admin" ||
    claims?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "Admin";

  return (
    <aside className="crypto-sidebar">
      <Link to="/" aria-label="Go to home page" style={{ display: "inline-block", marginBottom: "30px" }}>
        <img src={logo} alt="Logo" style={{ width: "100%", maxWidth: "150px" }} />
      </Link>
      <nav className="nav-links">
        {isAdmin && (
          <Link to="/Admin" className="nav-item nav-item-link" style={{ marginBottom: "12px", color: "#7f8cff" }}>
            Admin Panel
          </Link>
        )}
        {isAuthenticated && (
          <Link to="/VerifyIdentityPage" className="nav-item nav-item-link" style={{ marginBottom: "12px", color: "#7f8cff" }}>
            Verify Identity
          </Link>
        )}
        {NAV_ITEMS.map((item) => {
          if (item === "Profile Settings") {
            return (
              <Link key={item} to="/profile" className="nav-item nav-item-link" style={{ marginTop: "16px", color: "#7f8cff" }}>
                Profile Settings
              </Link>
            );
          }
          if (item === "More") {
            return (
              <div key={item} className="nav-item-dropdown-container">
                <div
                  className={`nav-item ${activeDropdown === "More" ? "active" : ""}`}
                  onClick={() => setActiveDropdown(activeDropdown === "More" ? null : "More")}
                >
                  {item} <span>{activeDropdown === "More" ? "▲" : "▼"}</span>
                </div>
                {activeDropdown === "More" && (
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
          if (item === "Tools") {
            return (
              <div key={item} className="nav-item-dropdown-container">
                <div
                  className={`nav-item ${activeDropdown === "Tools" ? "active" : ""}`}
                  onClick={() => setActiveDropdown(activeDropdown === "Tools" ? null : "Tools")}
                >
                  {item} <span>{activeDropdown === "Tools" ? "▲" : "▼"}</span>
                </div>
                {activeDropdown === "Tools" && (
                  <div className="nav-dropdown-menu">
                    <Link to="/buy-sell" className="nav-dropdown-item">Buy and Sell</Link>
                    <Link to="/withdraw" className="nav-dropdown-item">Withdraw</Link>

                    {/* <Link to="/*" className="nav-dropdown-item">ErrorPage1</Link> */}
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
                  {item} <span>{activeDropdown === "Social" ? "▲" : "▼"}</span>
                </div>
                {activeDropdown === "Social" && (
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
          if (item === "Crypto") {
            return (
              <div key={item} className="nav-item-dropdown-container">
                <div
                  className={`nav-item ${activeDropdown === "Crypto" ? "active" : ""}`}
                  onClick={() => setActiveDropdown(activeDropdown === "Crypto" ? null : "Crypto")}
                >
                  {item} <span>{activeDropdown === "Crypto" ? "▲" : "▼"}</span>
                </div>
                {activeDropdown === "Crypto" && (
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
          if (item === "Temp") {
            return (
              <div key={item} className="nav-item-dropdown-container">
                <div
                  className={`nav-item ${activeDropdown === "Temp" ? "active" : ""}`}
                  onClick={() => setActiveDropdown(activeDropdown === "Temp" ? null : "Temp")}
                >
                  {item} <span>{activeDropdown === "Temp" ? "▲" : "▼"}</span>
                </div>
                {activeDropdown === "Temp" && (
                  <div className="nav-dropdown-menu">
                    <Link to="/VerifyIdentityPage" className="nav-dropdown-item">VerifyIdentity</Link>
                    <Link to="/VerificationEmailPage" className="nav-dropdown-item">Verify Email</Link>
                    <Link to="/SentSMSToNumberPage" className="nav-dropdown-item">Sent SMS</Link>
                    {isAdmin && (
                      <Link to="/Admin" className="nav-dropdown-item">Admin</Link>
                    )}
                  </div>
                )}
              </div>
            );
          }
          if (item === "Sign Up") {
            if (isAuthenticated) {
              return null;
            }
            return (
              <Link key={item} to="/sign-up" className="nav-item nav-item-link" style={{ marginTop: "16px", color: "#7f8cff" }}>
                Sign Up
              </Link>
            );
          }
          if (item === "Sign In") {
            if (isAuthenticated) {
              return null;
            }
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
