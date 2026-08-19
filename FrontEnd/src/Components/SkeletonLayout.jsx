import { NavLink } from "react-router-dom";

const navigation = [
  ["/", "Dashboard"], ["/wallets", "Wallets"], ["/buy-sell", "Trade"],
  ["/news", "News"], ["/profile", "Profile"],
];

export default function SkeletonLayout({ children }) {
  return (
    <div className="skeleton-app">
      <aside className="skeleton-sidebar">
        <div className="skeleton-brand" aria-label="Digital Assets Market" />
        <nav aria-label="Primary navigation">
          {navigation.map(([to, label]) => (
            <NavLink key={to} to={to} aria-label={label}>
              <span className="skeleton-nav-icon" />
              <span className="skeleton-nav-label" />
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="skeleton-workspace">
        <header className="skeleton-topbar">
          <div className="skeleton-search" />
          <div className="skeleton-topbar-actions"><span /><span /><span className="skeleton-avatar" /></div>
        </header>
        {children}
      </div>
    </div>
  );
}
