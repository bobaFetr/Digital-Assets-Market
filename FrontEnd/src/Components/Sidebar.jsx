import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/Gemini_Generated_Image_sb5zszsb5zszsb5z.png";
import { getToken } from "../Services/Service";

const NAV_ITEMS = [
  "Social",
  "Profile Settings",
  "Real currencies",
  "Crypto",
  "Tools",
  "Temp",
  "Sign Up",
  "Sign In",
];

const ICONS = {
  Dashboard: "\u{1F3E0}",
  "Profile Settings": "\u{1F464}",
  Social: "\u{1F4AC}",
  "Real currencies": "\u{1F4B5}",
  Crypto: "\u{1F4B0}",
  Tools: "\u{1F6E0}",
  Temp: "\u{2699}",
  "Sign Up": "\u{1F4DD}",
  "Sign In": "\u{1F511}",
  Admin: "\u{1F6E1}",
};

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hovered, setHovered] = useState(null);
  const token = getToken();
  const location = useLocation();

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

  const baseBtn = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "transparent",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    fontWeight: 500,
    fontSize: "16px",
    padding: "10px 22px",
    margin: "2px 0",
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s",
  };

  const activeBtn = {
    ...baseBtn,
    background: "#ff7f50",
    color: "#fff",
    fontWeight: 700,
    boxShadow: "0 2px 8px #ff7f50a0",
  };

  const hoverBtn = {
    ...baseBtn,
    background: "rgba(255,127,80,0.18)",
    color: "#fff",
  };

  const isActive = (item) => {
    if (item === "Profile Settings") return location.pathname.startsWith("/profile");
    if (item === "Sign Up") return location.pathname.startsWith("/sign-up");
    if (item === "Sign In") return location.pathname.startsWith("/sign-in");
    if (item === "Admin") return location.pathname.startsWith("/Admin");
    if (item === "Social") {
      return ["/news", "/education", "/rug-pull", "/faq", "/support", "/feedback"].some((path) =>
        location.pathname.startsWith(path)
      );
    }
    if (item === "Real currencies") {
      return ["/real-currencies/btcusdt", "/real-currencies/bchusdt"].some((path) =>
        location.pathname.startsWith(path)
      );
    }
    if (item === "Crypto") {
      return ["/BitcoinChart", "/BNBChart", "/BCrypto"].some((path) =>
        location.pathname.startsWith(path)
      );
    }
    if (item === "Tools") return ["/buy-sell", "/withdraw"].some((path) => location.pathname.startsWith(path));
    if (item === "Temp") {
      return ["/VerificationEmailPage", "/SentSMSToNumberPage"].some((path) =>
        location.pathname.startsWith(path)
      );
    }
    return false;
  };

  const getBtnStyle = (item, dropdown) => {
    if (isActive(item) && (!dropdown || activeDropdown === item)) return activeBtn;
    if (hovered === item) return hoverBtn;
    return baseBtn;
  };

  const closeMobileSidebar = () => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("sidebar-open");
    }
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside className={`crypto-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-brand-row">
        <Link
          to="/"
          className="sidebar-brand"
          aria-label="Go to home page"
          onClick={() => closeMobileSidebar()}
        >
          <img className="sidebar-brand-image" src={logo} alt="Logo" />
        </Link>
        <button
          type="button"
          className="mobile-hamburger sidebar-close-button"
          aria-label="Close navigation"
          onClick={() => closeMobileSidebar()}
        >
          Close
        </button>
      </div>

      <nav className="nav-links">
        {isAdmin && (
          <Link
            to="/Admin"
            className="nav-item nav-item-link"
            style={getBtnStyle("Admin")}
            onMouseEnter={() => setHovered("Admin")}
            onMouseLeave={() => setHovered(null)}
            onClick={() => closeMobileSidebar()}
          >
            <span>{ICONS.Admin}</span> Admin Panel
          </Link>
        )}

        {NAV_ITEMS.map((item) => {
          const icon = ICONS[item] || "\u2022";

          if (["Tools", "Social", "Real currencies", "Crypto", "Temp"].includes(item)) {
            return (
              <div key={item} className="nav-item-dropdown-container">
                <div
                  className={`nav-item ${activeDropdown === item ? "active" : ""}`}
                  style={getBtnStyle(item, true)}
                  onClick={() => setActiveDropdown(activeDropdown === item ? null : item)}
                  onMouseEnter={() => setHovered(item)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span>{icon}</span> {item} <span>{activeDropdown === item ? "\u25B2" : "\u25BC"}</span>
                </div>

                {activeDropdown === item && (
                  <div className="nav-dropdown-menu">
                    {item === "Tools" && [
                      <Link
                        to="/buy-sell"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Tools")}
                        onMouseEnter={() => setHovered("Tools")}
                        onMouseLeave={() => setHovered(null)}
                        key="buy"
                        onClick={() => closeMobileSidebar()}
                      >
                        Buy and Sell
                      </Link>,
                      <Link
                        to="/withdraw"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Tools")}
                        onMouseEnter={() => setHovered("Tools")}
                        onMouseLeave={() => setHovered(null)}
                        key="withdraw"
                        onClick={() => closeMobileSidebar()}
                      >
                        Withdraw
                      </Link>,
                    ]}

                    {item === "Social" && [
                      <Link
                        to="/news"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Social")}
                        onMouseEnter={() => setHovered("Social")}
                        onMouseLeave={() => setHovered(null)}
                        key="news"
                        onClick={() => closeMobileSidebar()}
                      >
                        News
                      </Link>,
                      <Link
                        to="/education"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Social")}
                        onMouseEnter={() => setHovered("Social")}
                        onMouseLeave={() => setHovered(null)}
                        key="edu"
                        onClick={() => closeMobileSidebar()}
                      >
                        Education
                      </Link>,
                      <Link
                        to="/rug-pull"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Social")}
                        onMouseEnter={() => setHovered("Social")}
                        onMouseLeave={() => setHovered(null)}
                        key="rug"
                        onClick={() => closeMobileSidebar()}
                      >
                        Rug Pull
                      </Link>,
                      <Link
                        to="/faq"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Social")}
                        onMouseEnter={() => setHovered("Social")}
                        onMouseLeave={() => setHovered(null)}
                        key="faq"
                        onClick={() => closeMobileSidebar()}
                      >
                        Questions and Answers
                      </Link>,
                      <Link
                        to="/support"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Social")}
                        onMouseEnter={() => setHovered("Social")}
                        onMouseLeave={() => setHovered(null)}
                        key="support"
                        onClick={() => closeMobileSidebar()}
                      >
                        Support
                      </Link>,
                      <Link
                        to="/feedback"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Social")}
                        onMouseEnter={() => setHovered("Social")}
                        onMouseLeave={() => setHovered(null)}
                        key="feedback"
                        onClick={() => closeMobileSidebar()}
                      >
                        Feedback
                      </Link>,
                    ]}

                    {item === "Real currencies" && [
                      <Link
                        to="/real-currencies/btcusdt"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Real currencies")}
                        onMouseEnter={() => setHovered("Real currencies")}
                        onMouseLeave={() => setHovered(null)}
                        key="real-btc"
                        onClick={() => closeMobileSidebar()}
                      >
                        BTCUSDT
                      </Link>,
                      <Link
                        to="/real-currencies/bchusdt"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Real currencies")}
                        onMouseEnter={() => setHovered("Real currencies")}
                        onMouseLeave={() => setHovered(null)}
                        key="real-bch"
                        onClick={() => closeMobileSidebar()}
                      >
                        BCHUSDT
                      </Link>,
                    ]}

                    {item === "Crypto" && [
                      <Link
                        to="/BitcoinChart"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Crypto")}
                        onMouseEnter={() => setHovered("Crypto")}
                        onMouseLeave={() => setHovered(null)}
                        key="btc"
                        onClick={() => closeMobileSidebar()}
                      >
                        BTC
                      </Link>,
                      <Link
                        to="/BNBChart"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Crypto")}
                        onMouseEnter={() => setHovered("Crypto")}
                        onMouseLeave={() => setHovered(null)}
                        key="bnb"
                        onClick={() => closeMobileSidebar()}
                      >
                        BNB
                      </Link>,
                      <Link
                        to="/BCrypto"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Crypto")}
                        onMouseEnter={() => setHovered("Crypto")}
                        onMouseLeave={() => setHovered(null)}
                        key="bcrypto"
                        onClick={() => closeMobileSidebar()}
                      >
                        BCrypto
                      </Link>,
                      <Link
                        to="/withdraw"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Crypto")}
                        onMouseEnter={() => setHovered("Crypto")}
                        onMouseLeave={() => setHovered(null)}
                        key="withdraw2"
                      />
                    ]}

                    {item === "Temp" && [
                      <Link
                        to="/VerificationEmailPage"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Temp")}
                        onMouseEnter={() => setHovered("Temp")}
                        onMouseLeave={() => setHovered(null)}
                        key="verify"
                        onClick={() => closeMobileSidebar()}
                      >
                        Verify Email
                      </Link>,
                      <Link
                        to="/SentSMSToNumberPage"
                        className="nav-dropdown-item"
                        style={getBtnStyle("Temp")}
                        onMouseEnter={() => setHovered("Temp")}
                        onMouseLeave={() => setHovered(null)}
                        key="sms"
                        onClick={() => closeMobileSidebar()}
                      >
                        Sent SMS
                      </Link>,
                      isAdmin && (
                        <Link
                          to="/Admin"
                          className="nav-dropdown-item"
                          style={getBtnStyle("Admin")}
                          onMouseEnter={() => setHovered("Admin")}
                          onMouseLeave={() => setHovered(null)}
                          key="admin"
                        >
                          Admin
                        </Link>
                      ),
                    ]}
                  </div>
                )}
              </div>
            );
          }

          if (item === "Profile Settings") {
            return (
              <Link
                key={item}
                to="/profile"
                className="nav-item nav-item-link"
                style={getBtnStyle(item)}
                onMouseEnter={() => setHovered(item)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => closeMobileSidebar()}
              >
                <span>{icon}</span> {item}
              </Link>
            );
          }

          if (item === "Sign Up") {
            if (isAuthenticated) {
              return null;
            }

            return (
              <Link
                key={item}
                to="/sign-up"
                className="nav-item nav-item-link"
                style={getBtnStyle(item)}
                onMouseEnter={() => setHovered(item)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => closeMobileSidebar()}
              >
                <span>{icon}</span> Sign Up
              </Link>
            );
          }

          if (item === "Sign In") {
            if (isAuthenticated) {
              return null;
            }

            return (
              <Link
                key={item}
                to="/sign-in"
                className="nav-dropdown-item"
                style={getBtnStyle(item)}
                onMouseEnter={() => setHovered(item)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => closeMobileSidebar()}
              >
                <span>{icon}</span> Sign In
              </Link>
            );
          }

          return (
            <div
              key={item}
              className="nav-item"
              style={getBtnStyle(item)}
              onMouseEnter={() => setHovered(item)}
              onMouseLeave={() => setHovered(null)}
            >
              <span>{icon}</span> {item}
            </div>
          );
        })}
      </nav>

      <nav className="mobile-bottom-nav" role="navigation" aria-label="Mobile navigation">
        <Link to="/" className="mobile-link" onClick={() => closeMobileSidebar()}>
          <span className="mobile-icon">{ICONS.Dashboard}</span>
          <span className="mobile-label">Home</span>
        </Link>
        <Link to="/news" className="mobile-link" onClick={() => closeMobileSidebar()}>
          <span className="mobile-icon">{ICONS.Social}</span>
          <span className="mobile-label">News</span>
        </Link>
        <Link to="/BitcoinChart" className="mobile-link" onClick={() => closeMobileSidebar()}>
          <span className="mobile-icon">{ICONS.Crypto}</span>
          <span className="mobile-label">Markets</span>
        </Link>
        <Link to="/buy-sell" className="mobile-link" onClick={() => closeMobileSidebar()}>
          <span className="mobile-icon">+</span>
          <span className="mobile-label">Trade</span>
        </Link>
        <Link to="/profile" className="mobile-link" onClick={() => closeMobileSidebar()}>
          <span className="mobile-icon">{ICONS["Profile Settings"]}</span>
          <span className="mobile-label">Profile</span>
        </Link>
      </nav>
    </aside>
  );
}
