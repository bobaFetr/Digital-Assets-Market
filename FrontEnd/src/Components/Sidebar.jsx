import React, { useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import darkLogo from "../assets/Gemini_Generated_Image_sb5zszsb5zszsb5z.png";
import lightLogo from "../assets/Copilot_20251008_144326.png";
import { getToken } from "../Services/Service";

const getClaimsFromToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
};

const getUserRole = (token) => {
  const claims = getClaimsFromToken(token);
  return (
    claims?.role ||
    claims?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    ""
  );
};

const navLinkStyle = ({ isActive }) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 18px",
  borderRadius: "999px",
  color: isActive ? "#fff" : "var(--text-primary)",
  textDecoration: "none",
  background: isActive ? "var(--brand-accent)" : "transparent",
  boxShadow: isActive ? "0 2px 8px rgba(255, 127, 80, 0.35)" : "none",
  border: isActive ? "1px solid transparent" : "1px solid var(--glass-border)",
  fontWeight: isActive ? 700 : 500,
});

const sectionTitleStyle = {
  margin: "16px 0 8px",
  padding: "0 18px",
  color: "var(--text-secondary)",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const token = getToken();
  const role = useMemo(() => getUserRole(token), [token]);
  const isAuthenticated = Boolean(token);
  const isAdmin = role === "Admin";

  const publicLinks = [
    { to: "/", label: "Home", icon: "Home" },
    { to: "/news", label: "News", icon: "News" },
    { to: "/education", label: "Education", icon: "Learn" },
    { to: "/faq", label: "FAQ", icon: "FAQ" },
    { to: "/BitcoinChart", label: "Markets", icon: "Market" },
  ];

  const userLinks = [
    { to: "/profile", label: "Profile", icon: "Profile" },
    { to: "/wallets", label: "Wallets", icon: "Wallets" },
    { to: "/buy-sell", label: "Buy / Sell", icon: "Trade" },
    { to: "/withdraw", label: "Withdraw", icon: "Cash" },
    { to: "/VerifyIdentityPage", label: "Identity", icon: "ID" },
  ];

  const guestLinks = [
    { to: "/sign-in", label: "Sign In", icon: "Login" },
    { to: "/sign-up", label: "Sign Up", icon: "Join" },
  ];

  const closeMobileSidebar = () => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("sidebar-open");
    }

    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const renderLinks = (links) =>
    links.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        className="nav-item nav-item-link"
        style={navLinkStyle}
        onClick={closeMobileSidebar}
      >
        <span>{link.label}</span>
      </NavLink>
    ));

  return (
    <aside className={`crypto-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-brand-row">
        <Link
          to="/"
          className="sidebar-brand"
          aria-label="Go to home page"
          onClick={closeMobileSidebar}
        >
          <img
            className="sidebar-brand-image sidebar-brand-image--dark"
            src={darkLogo}
            alt="Digital Asset Marketplace"
          />
          <img
            className="sidebar-brand-image sidebar-brand-image--light"
            src={lightLogo}
            alt="Digital Asset Marketplace"
          />
        </Link>
        <button
          type="button"
          className="mobile-hamburger sidebar-close-button"
          aria-label="Close navigation"
          onClick={closeMobileSidebar}
        >
          Close
        </button>
      </div>

      <nav className="nav-links">
        <div style={sectionTitleStyle}>Explore</div>
        {renderLinks(publicLinks)}

        {isAuthenticated && (
          <>
            <div style={sectionTitleStyle}>Account</div>
            {renderLinks(userLinks)}
          </>
        )}

        {isAdmin && (
          <>
            <div style={sectionTitleStyle}>Admin</div>
            {renderLinks([{ to: "/Admin", label: "Admin Panel", icon: "Admin" }])}
          </>
        )}

        {!isAuthenticated && (
          <>
            <div style={sectionTitleStyle}>Access</div>
            {renderLinks(guestLinks)}
          </>
        )}
      </nav>

      <nav className="mobile-bottom-nav" role="navigation" aria-label="Mobile navigation">
        {renderLinks(
          isAuthenticated
            ? [
                { to: "/", label: "Home", icon: "Home" },
                { to: "/buy-sell", label: "Trade", icon: "Trade" },
                { to: "/wallets", label: "Wallets", icon: "Wallets" },
                { to: "/profile", label: "Profile", icon: "Profile" },
              ]
            : [
                { to: "/", label: "Home", icon: "Home" },
                { to: "/news", label: "News", icon: "News" },
                { to: "/sign-in", label: "Sign In", icon: "Login" },
                { to: "/sign-up", label: "Sign Up", icon: "Join" },
              ]
        )}
      </nav>
    </aside>
  );
}
