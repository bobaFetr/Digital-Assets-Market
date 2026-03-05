import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/Gemini_Generated_Image_sb5zszsb5zszsb5z.png";
import { getToken } from "../Services/Service";

const NAV_ITEMS = [
  "Social",
  "Profile Settings",
  "Crypto",
  "Tools",
  "Temp",
  "Sign Up",
  "Sign In",
];

// Icon mapping for sidebar items (using emoji as placeholder)
const ICONS = {
  Dashboard: '🏠',
  'Profile Settings': '👤',
  Social: '💬',
  Crypto: '💰',
  Tools: '🛠️',
  Temp: '⚙️',
  'Sign Up': '📝',
  'Sign In': '🔑',
  Admin: '🛡️',
};

export default function Sidebar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
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

  // Style for sidebar buttons
  const baseBtn = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'transparent',
    color: '#fff',
    border: 'none',
    borderRadius: '999px',
    fontWeight: 500,
    fontSize: '16px',
    padding: '10px 22px',
    margin: '2px 0',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
  };
  const activeBtn = {
    ...baseBtn,
    background: '#ff7f50',
    color: '#fff',
    fontWeight: 700,
    boxShadow: '0 2px 8px #ff7f50a0',
  };
  const hoverBtn = {
    ...baseBtn,
    background: 'rgba(255,127,80,0.18)',
    color: '#fff',
  };

  // Helper to determine if a nav item is active based on route
  const isActive = (item) => {
    if (item === 'Profile Settings') return location.pathname.startsWith('/profile');
    if (item === 'Sign Up') return location.pathname.startsWith('/sign-up');
    if (item === 'Sign In') return location.pathname.startsWith('/sign-in');
    if (item === 'Admin') return location.pathname.startsWith('/Admin');
    if (item === 'Social') return ['/news','/education','/rug-pull','/faq','/support','/feedback'].some(p => location.pathname.startsWith(p));
    if (item === 'Crypto') return ['/BitcoinChart','/BNBChart','/BCrypto'].some(p => location.pathname.startsWith(p));
    if (item === 'Tools') return ['/buy-sell','/withdraw'].some(p => location.pathname.startsWith(p));
    if (item === 'Temp') return ['/VerificationEmailPage','/SentSMSToNumberPage'].some(p => location.pathname.startsWith(p));
    return false;
  };

  // Helper for hover effect
  const [hovered, setHovered] = useState(null);
  const getBtnStyle = (item, dropdown) => {
    if (isActive(item) && (!dropdown || activeDropdown === item)) return activeBtn;
    if (hovered === item) return hoverBtn;
    return baseBtn;
  };

  return (
    <aside className="crypto-sidebar">
      <Link to="/" aria-label="Go to home page" style={{ display: "inline-block", marginBottom: "30px" }}>
        <img src={logo} alt="Logo" style={{ width: "100%", maxWidth: "150px" }} />
      </Link>
      <nav className="nav-links">
        {isAdmin && (
          <Link to="/Admin" className="nav-item nav-item-link"
            style={getBtnStyle('Admin')}
            onMouseEnter={() => setHovered('Admin')}
            onMouseLeave={() => setHovered(null)}
          >
            <span>{ICONS.Admin}</span> Admin Panel
          </Link>
        )}
        {NAV_ITEMS.map((item) => {
          const icon = ICONS[item] || '•';
          if (["Tools", "Social", "Crypto", "Temp"].includes(item)) {
            return (
              <div key={item} className="nav-item-dropdown-container">
                <div
                  className={`nav-item ${activeDropdown === item ? "active" : ""}`}
                  style={getBtnStyle(item, true)}
                  onClick={() => setActiveDropdown(activeDropdown === item ? null : item)}
                  onMouseEnter={() => setHovered(item)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span>{icon}</span> {item} <span>{activeDropdown === item ? "▲" : "▼"}</span>
                </div>
                {activeDropdown === item && (
                  <div className="nav-dropdown-menu">
                    {item === "Tools" && [
                      <Link to="/buy-sell" className="nav-dropdown-item" style={getBtnStyle('Tools')}
                        onMouseEnter={() => setHovered('Tools')}
                        onMouseLeave={() => setHovered(null)} key="buy">Buy and Sell</Link>,
                      <Link to="/withdraw" className="nav-dropdown-item" style={getBtnStyle('Tools')}
                        onMouseEnter={() => setHovered('Tools')}
                        onMouseLeave={() => setHovered(null)} key="withdraw">Withdraw</Link>,
                    ]}
                    {item === "Social" && [
                      <Link to="/news" className="nav-dropdown-item" style={getBtnStyle('Social')}
                        onMouseEnter={() => setHovered('Social')}
                        onMouseLeave={() => setHovered(null)} key="news">News</Link>,
                      <Link to="/education" className="nav-dropdown-item" style={getBtnStyle('Social')}
                        onMouseEnter={() => setHovered('Social')}
                        onMouseLeave={() => setHovered(null)} key="edu">Education</Link>,
                      <Link to="/rug-pull" className="nav-dropdown-item" style={getBtnStyle('Social')}
                        onMouseEnter={() => setHovered('Social')}
                        onMouseLeave={() => setHovered(null)} key="rug">Rug Pull</Link>,
                      <Link to="/faq" className="nav-dropdown-item" style={getBtnStyle('Social')}
                        onMouseEnter={() => setHovered('Social')}
                        onMouseLeave={() => setHovered(null)} key="faq">Questions and Answers</Link>,
                      <Link to="/support" className="nav-dropdown-item" style={getBtnStyle('Social')}
                        onMouseEnter={() => setHovered('Social')}
                        onMouseLeave={() => setHovered(null)} key="support">Support</Link>,
                      <Link to="/feedback" className="nav-dropdown-item" style={getBtnStyle('Social')}
                        onMouseEnter={() => setHovered('Social')}
                        onMouseLeave={() => setHovered(null)} key="feedback">Feedback</Link>,
                    ]}
                    {item === "Crypto" && [
                      <Link to="/BitcoinChart" className="nav-dropdown-item" style={getBtnStyle('Crypto')}
                        onMouseEnter={() => setHovered('Crypto')}
                        onMouseLeave={() => setHovered(null)} key="btc">BTC</Link>,
                      <Link to="/BNBChart" className="nav-dropdown-item" style={getBtnStyle('Crypto')}
                        onMouseEnter={() => setHovered('Crypto')}
                        onMouseLeave={() => setHovered(null)} key="bnb">BNB</Link>,
                      <Link to="/BCrypto" className="nav-dropdown-item" style={getBtnStyle('Crypto')}
                        onMouseEnter={() => setHovered('Crypto')}
                        onMouseLeave={() => setHovered(null)} key="bcrypto">BCrypto</Link>,
                      <Link to="/withdraw" className="nav-dropdown-item" style={getBtnStyle('Crypto')}
                        onMouseEnter={() => setHovered('Crypto')}
                        onMouseLeave={() => setHovered(null)} key="withdraw2"></Link>,
                    ]}
                    {item === "Temp" && [
                      <Link to="/VerificationEmailPage" className="nav-dropdown-item" style={getBtnStyle('Temp')}
                        onMouseEnter={() => setHovered('Temp')}
                        onMouseLeave={() => setHovered(null)} key="verify">Verify Email</Link>,
                      <Link to="/SentSMSToNumberPage" className="nav-dropdown-item" style={getBtnStyle('Temp')}
                        onMouseEnter={() => setHovered('Temp')}
                        onMouseLeave={() => setHovered(null)} key="sms">Sent SMS</Link>,
                      isAdmin && <Link to="/Admin" className="nav-dropdown-item" style={getBtnStyle('Admin')}
                        onMouseEnter={() => setHovered('Admin')}
                        onMouseLeave={() => setHovered(null)} key="admin">Admin</Link>,
                    ]}
                  </div>
                )}
              </div>
            );
          }
          if (item === "Profile Settings") {
            return (
              <Link key={item} to="/profile" className="nav-item nav-item-link"
                style={getBtnStyle(item)}
                onMouseEnter={() => setHovered(item)}
                onMouseLeave={() => setHovered(null)}
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
              <Link key={item} to="/sign-up" className="nav-item nav-item-link"
                style={getBtnStyle(item)}
                onMouseEnter={() => setHovered(item)}
                onMouseLeave={() => setHovered(null)}
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
              <Link key={item} to="/sign-in" className="nav-dropdown-item"
                style={getBtnStyle(item)}
                onMouseEnter={() => setHovered(item)}
                onMouseLeave={() => setHovered(null)}
              >
                <span>{icon}</span> Sign In
              </Link>
            );
          }
          return (
            <div key={item} className="nav-item"
              style={getBtnStyle(item)}
              onMouseEnter={() => setHovered(item)}
              onMouseLeave={() => setHovered(null)}
            >
              <span>{icon}</span> {item}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
