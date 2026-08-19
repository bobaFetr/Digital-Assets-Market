import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getToken, getUserRoleHint } from "../Services/Service";

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const token = getToken();
  const role = getUserRoleHint();
  const isAuthenticated = Boolean(token);
  const isAdmin = role === "Admin";

  const publicLinks = [
    { to: "/", label: "Home", icon: "Home" },
    { to: "/news", label: "News", icon: "News" },
    { to: "/education", label: "Education", icon: "Learn" },
    { to: "/faq", label: "Questions and answers", icon: "FAQ" },
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

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/news?q=${encodeURIComponent(query)}` : "/news");
    closeMobileSidebar();
  };

  const renderLinks = (links) =>
    links.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        className="nav-item nav-item-link"
        onClick={closeMobileSidebar}
      >
        <span className="nav-item__mark" aria-hidden="true">{link.icon.slice(0, 2).toUpperCase()}</span>
        <span>{link.label}</span>
      </NavLink>
    ));

  return (
    <>
    <aside className={`crypto-sidebar ${isAuthenticated ? "is-authenticated" : "is-guest"} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-brand-row">
        <Link
          to="/"
          className="sidebar-brand"
          aria-label="Go to home page"
          onClick={closeMobileSidebar}
        >
          <span className="sidebar-brand-mark">DM</span>
          <span className="sidebar-brand-copy"><strong>Digital Market</strong><small>Paper exchange</small></span>
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

      <form className="desktop-header-search" role="search" onSubmit={submitSearch}>
        <label className="visually-hidden" htmlFor="desktop-market-search">Search assets, markets, or news</label>
        <input
          id="desktop-market-search"
          type="search"
          placeholder="Search assets, markets, or news..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <button type="submit" aria-label="Search">Search</button>
      </form>

      <nav className="nav-links">
        <div className="nav-section-title">Explore</div>
        {renderLinks(publicLinks)}

        {isAuthenticated && (
          <>
            <div className="nav-section-title">Account</div>
            {renderLinks(userLinks)}
          </>
        )}

        {isAdmin && (
          <>
            <div className="nav-section-title">Admin</div>
            {renderLinks([{ to: "/Admin", label: "Admin Panel", icon: "Admin" }])}
          </>
        )}

        {!isAuthenticated && (
          <>
            <div className="nav-section-title">Access</div>
            {renderLinks(guestLinks)}
          </>
        )}
      </nav>

      <div className="sidebar-environment"><span className="sidebar-environment__dot" />Simulation mode</div>

    </aside>
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
    </>
  );
}
