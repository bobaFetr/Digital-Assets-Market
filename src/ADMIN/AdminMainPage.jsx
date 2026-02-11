import React from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import "./Admin.css";

const quickMetrics = [
  { label: "24h Volume", value: "$48.2M", trend: "+12.4%", tone: "success" },
  { label: "New Users", value: "1,294", trend: "+5.8%", tone: "success" },
  { label: "KYC Queue", value: "83", trend: "-10.2%", tone: "warning" },
  { label: "Risk Flags", value: "7", trend: "+2", tone: "danger" },
];

const activityFeed = [
  {
    title: "Withdrawal review required",
    meta: "Order #3091 · 2.1 BTC · VIP customer",
    time: "2m ago",
    tone: "warning",
  },
  {
    title: "KYC approved",
    meta: "User: ava.h · Tier 2",
    time: "18m ago",
    tone: "success",
  },
  {
    title: "Suspicious login blocked",
    meta: "User: r.severin · RU",
    time: "45m ago",
    tone: "danger",
  },
  {
    title: "New listing request",
    meta: "Asset: OMEGA · Pending review",
    time: "1h ago",
    tone: "info",
  },
];

const kycQueue = [
  { name: "Sofia R.", tier: "Tier 1", risk: "Low", time: "12m" },
  { name: "Marcus D.", tier: "Tier 2", risk: "Medium", time: "1h" },
  { name: "Aditi V.", tier: "Tier 3", risk: "High", time: "2h" },
  { name: "Leo M.", tier: "Tier 2", risk: "Medium", time: "4h" },
];

const topAssets = [
  { symbol: "BTC", price: "$62,114", change: "+3.1%", volume: "$18.4M" },
  { symbol: "ETH", price: "$3,292", change: "+2.4%", volume: "$11.2M" },
  { symbol: "BNB", price: "$412", change: "-1.7%", volume: "$6.8M" },
  { symbol: "SOL", price: "$118", change: "+4.5%", volume: "$5.9M" },
];

const recentTransactions = [
  {
    id: "TX-98331",
    user: "lara.m",
    type: "Deposit",
    asset: "USDT",
    amount: "+24,000",
    status: "Completed",
  },
  {
    id: "TX-98312",
    user: "hayden",
    type: "Withdrawal",
    asset: "BTC",
    amount: "-0.82",
    status: "Review",
  },
  {
    id: "TX-98241",
    user: "mina.k",
    type: "Trade",
    asset: "ETH",
    amount: "+14.2",
    status: "Completed",
  },
  {
    id: "TX-98197",
    user: "solis",
    type: "Transfer",
    asset: "BNB",
    amount: "-120",
    status: "Flagged",
  },
];

const announcements = [
  {
    title: "Trading desk maintenance",
    detail: "Scheduled for Feb 14, 02:00 UTC. Expect 12 min downtime.",
  },
  {
    title: "New staking tier",
    detail: "Tier 4 launches with 8.2% APY. Prepare comms rollout.",
  },
];

/* ===== Pages ===== */
const Dashboard = () => (
  <div className="admin-page">
    <section className="hero-panel">
      <div>
        <p className="eyebrow">Operations Overview</p>
        <h1>Command Center</h1>
        <p className="hero-subtext">
          Live market health, compliance queue, and revenue signals in one place.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary">Open Incident Room</button>
          <button className="btn btn-ghost">Generate Ops Report</button>
        </div>
      </div>
      <div className="hero-status">
        <div>
          <p className="label">System Status</p>
          <h3 className="status-green">All systems stable</h3>
        </div>
        <div>
          <p className="label">Latency</p>
          <h3>142ms</h3>
        </div>
        <div>
          <p className="label">Alerts</p>
          <h3>2 active</h3>
        </div>
      </div>
    </section>

    <section className="metric-grid">
      {quickMetrics.map((metric) => (
        <article key={metric.label} className={`metric-card tone-${metric.tone}`}>
          <p className="label">{metric.label}</p>
          <h3>{metric.value}</h3>
          <span className="chip">{metric.trend}</span>
        </article>
      ))}
    </section>

    <section className="split-grid">
      <article className="panel">
        <div className="panel-header">
          <h3>Live Activity</h3>
          <button className="btn btn-ghost">View all</button>
        </div>
        <div className="activity-list">
          {activityFeed.map((item) => (
            <div key={item.title} className={`activity-card tone-${item.tone}`}>
              <div>
                <h4>{item.title}</h4>
                <p>{item.meta}</p>
              </div>
              <span className="time">{item.time}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-header">
          <h3>KYC Review Queue</h3>
          <button className="btn btn-ghost">Open queue</button>
        </div>
        <div className="table">
          <div className="table-row table-head">
            <span>User</span>
            <span>Tier</span>
            <span>Risk</span>
            <span>Wait</span>
          </div>
          {kycQueue.map((row) => (
            <div className="table-row" key={row.name}>
              <span>{row.name}</span>
              <span>{row.tier}</span>
              <span>{row.risk}</span>
              <span>{row.time}</span>
            </div>
          ))}
        </div>
      </article>
    </section>

    <section className="wide-panel">
      <div className="panel-header">
        <h3>Top Assets</h3>
        <button className="btn btn-ghost">Manage listings</button>
      </div>
      <div className="table">
        <div className="table-row table-head">
          <span>Asset</span>
          <span>Price</span>
          <span>Change</span>
          <span>24h Volume</span>
        </div>
        {topAssets.map((asset) => (
          <div className="table-row" key={asset.symbol}>
            <span>{asset.symbol}</span>
            <span>{asset.price}</span>
            <span>{asset.change}</span>
            <span>{asset.volume}</span>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const Assets = () => (
  <div className="admin-page">
    <div className="page-header">
      <h2>Assets</h2>
      <button className="btn btn-primary">Add Listing</button>
    </div>
    <div className="panel">
      <div className="panel-header">
        <h3>Listings</h3>
        <button className="btn btn-ghost">Export</button>
      </div>
      <div className="table">
        <div className="table-row table-head">
          <span>Symbol</span>
          <span>Network</span>
          <span>Status</span>
          <span>Liquidity</span>
        </div>
        {topAssets.map((asset) => (
          <div className="table-row" key={asset.symbol}>
            <span>{asset.symbol}</span>
            <span>Primary</span>
            <span className="badge success">Active</span>
            <span>{asset.volume}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Transactions = () => (
  <div className="admin-page">
    <div className="page-header">
      <h2>Transactions</h2>
      <div className="inline-actions">
        <button className="btn btn-ghost">Filters</button>
        <button className="btn btn-primary">Flag Review</button>
      </div>
    </div>
    <div className="panel">
      <div className="panel-header">
        <h3>Recent</h3>
        <button className="btn btn-ghost">Export</button>
      </div>
      <div className="table">
        <div className="table-row table-head">
          <span>Transaction</span>
          <span>User</span>
          <span>Type</span>
          <span>Asset</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {recentTransactions.map((tx) => (
          <div className="table-row" key={tx.id}>
            <span>{tx.id}</span>
            <span>{tx.user}</span>
            <span>{tx.type}</span>
            <span>{tx.asset}</span>
            <span>{tx.amount}</span>
            <span className={`badge ${tx.status === "Completed" ? "success" : tx.status === "Review" ? "warning" : "danger"}`}>
              {tx.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Users = () => (
  <div className="admin-page">
    <div className="page-header">
      <h2>Users</h2>
      <div className="inline-actions">
        <button className="btn btn-ghost">Segments</button>
        <button className="btn btn-primary">Invite VIP</button>
      </div>
    </div>
    <div className="split-grid">
      <article className="panel">
        <div className="panel-header">
          <h3>VIP Watchlist</h3>
          <button className="btn btn-ghost">Assign RM</button>
        </div>
        <div className="activity-list">
          {activityFeed.slice(0, 3).map((item) => (
            <div key={item.title} className={`activity-card tone-${item.tone}`}>
              <div>
                <h4>{item.title}</h4>
                <p>{item.meta}</p>
              </div>
              <span className="time">{item.time}</span>
            </div>
          ))}
        </div>
      </article>
      <article className="panel">
        <div className="panel-header">
          <h3>Risk Flags</h3>
          <button className="btn btn-ghost">Review</button>
        </div>
        <div className="table">
          <div className="table-row table-head">
            <span>User</span>
            <span>Reason</span>
            <span>Priority</span>
          </div>
          <div className="table-row">
            <span>r.severin</span>
            <span>Login anomaly</span>
            <span className="badge danger">High</span>
          </div>
          <div className="table-row">
            <span>n.liu</span>
            <span>Large withdrawal</span>
            <span className="badge warning">Medium</span>
          </div>
          <div className="table-row">
            <span>m.artis</span>
            <span>Multiple devices</span>
            <span className="badge warning">Medium</span>
          </div>
        </div>
      </article>
    </div>
  </div>
);

const News = () => (
  <div className="admin-page">
    <div className="page-header">
      <h2>Newsroom</h2>
      <button className="btn btn-primary">Create Brief</button>
    </div>
    <div className="panel">
      <div className="panel-header">
        <h3>Announcements</h3>
        <button className="btn btn-ghost">Publish</button>
      </div>
      <div className="cards-grid">
        {announcements.map((item) => (
          <article key={item.title} className="info-card">
            <h4>{item.title}</h4>
            <p>{item.detail}</p>
            <button className="btn btn-ghost">Edit</button>
          </article>
        ))}
      </div>
    </div>
  </div>
);

const Announcements = () => (
  <div className="admin-page">
    <div className="page-header">
      <h2>Announcements</h2>
      <button className="btn btn-primary">Draft</button>
    </div>
    <div className="panel">
      <div className="panel-header">
        <h3>Recent Broadcasts</h3>
        <button className="btn btn-ghost">Schedule</button>
      </div>
      <div className="activity-list">
        {announcements.map((item) => (
          <div key={item.title} className="activity-card tone-info">
            <div>
              <h4>{item.title}</h4>
              <p>{item.detail}</p>
            </div>
            <span className="time">Draft</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Security = () => (
  <div className="admin-page">
    <div className="page-header">
      <h2>Security</h2>
      <button className="btn btn-primary">Run Audit</button>
    </div>
    <div className="split-grid">
      <article className="panel">
        <div className="panel-header">
          <h3>Active Policies</h3>
          <button className="btn btn-ghost">Edit</button>
        </div>
        <div className="policy-list">
          <div>
            <h4>Withdrawal Cooldown</h4>
            <p>Hold period: 30 minutes for high-risk accounts.</p>
          </div>
          <div>
            <h4>Device Verification</h4>
            <p>Require new device approval on flagged IPs.</p>
          </div>
          <div>
            <h4>AML Threshold</h4>
            <p>Auto-freeze over $100k within 15 minutes.</p>
          </div>
        </div>
      </article>
      <article className="panel">
        <div className="panel-header">
          <h3>Audit Trail</h3>
          <button className="btn btn-ghost">View logs</button>
        </div>
        <div className="table">
          <div className="table-row table-head">
            <span>Event</span>
            <span>Actor</span>
            <span>Time</span>
          </div>
          <div className="table-row">
            <span>Policy update</span>
            <span>Admin-01</span>
            <span>Today, 09:22</span>
          </div>
          <div className="table-row">
            <span>New key rotation</span>
            <span>Security Bot</span>
            <span>Today, 02:14</span>
          </div>
          <div className="table-row">
            <span>Incident cleared</span>
            <span>Admin-04</span>
            <span>Yesterday, 22:05</span>
          </div>
        </div>
      </article>
    </div>
  </div>
);

const Settings = () => (
  <div className="admin-page">
    <div className="page-header">
      <h2>Settings</h2>
      <button className="btn btn-primary">Save changes</button>
    </div>
    <div className="split-grid">
      <article className="panel">
        <div className="panel-header">
          <h3>Team</h3>
          <button className="btn btn-ghost">Invite</button>
        </div>
        <div className="activity-list">
          <div className="activity-card tone-info">
            <div>
              <h4>Alex Kim</h4>
              <p>Super Admin · Active</p>
            </div>
            <span className="time">Online</span>
          </div>
          <div className="activity-card tone-success">
            <div>
              <h4>Maya Soto</h4>
              <p>Compliance Lead · Active</p>
            </div>
            <span className="time">2m</span>
          </div>
          <div className="activity-card tone-warning">
            <div>
              <h4>Remy H.</h4>
              <p>Risk Analyst · Away</p>
            </div>
            <span className="time">15m</span>
          </div>
        </div>
      </article>
      <article className="panel">
        <div className="panel-header">
          <h3>Notifications</h3>
          <button className="btn btn-ghost">Configure</button>
        </div>
        <div className="notification-grid">
          <div className="toggle-card">
            <div>
              <h4>Critical Alerts</h4>
              <p>Push + Slack</p>
            </div>
            <span className="chip">On</span>
          </div>
          <div className="toggle-card">
            <div>
              <h4>KYC Updates</h4>
              <p>Email digest</p>
            </div>
            <span className="chip">Daily</span>
          </div>
          <div className="toggle-card">
            <div>
              <h4>Market Shifts</h4>
              <p>SMS alert</p>
            </div>
            <span className="chip">On</span>
          </div>
        </div>
      </article>
    </div>
  </div>
);

/* ===== Sidebar ===== */
function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div>
          <p className="eyebrow">Digital Assets Market</p>
          <h2>Admin Suite</h2>
        </div>
        <span className="badge success">Live</span>
      </div>
      <div className="admin-section">
        <p className="section-title">Core</p>
        <NavLink className="nav-link" to="/Admin" end>Dashboard</NavLink>
        <NavLink className="nav-link" to="/Admin/assets">Assets</NavLink>
        <NavLink className="nav-link" to="/Admin/transactions">Transactions</NavLink>
        <NavLink className="nav-link" to="/Admin/users">Users</NavLink>
      </div>
      <div className="admin-section">
        <p className="section-title">Comms</p>
        <NavLink className="nav-link" to="/Admin/news">Newsroom</NavLink>
        <NavLink className="nav-link" to="/Admin/announcements">Announcements</NavLink>
      </div>
      <div className="admin-section">
        <p className="section-title">Governance</p>
        <NavLink className="nav-link" to="/Admin/security">Security</NavLink>
        <NavLink className="nav-link" to="/Admin/settings">Settings</NavLink>
      </div>
      <div className="sidebar-actions">
        <button className="btn btn-primary">New broadcast</button>
        <button className="btn btn-ghost">View status page</button>
      </div>
    </aside>
  );
}

function AdminHeader() {
  return (
    <header className="admin-header">
      <div>
        <p className="eyebrow">Today · Feb 11</p>
        <h2>Good evening, Admin</h2>
      </div>
      <div className="header-actions">
        <div className="search-pill">
          <span>Search</span>
          <input placeholder="Users, orders, alerts..." />
        </div>
        <button className="btn btn-ghost">Export</button>
        <button className="btn btn-primary">Create alert</button>
        <div className="admin-avatar">AK</div>
      </div>
    </header>
  );
}

/* ===== Admin Layout ===== */
export default function Admin() {
  return (
    <div className="admin-shell">
      <div className="admin-backdrop" />
      <Sidebar />
      <main className="admin-content">
        <AdminHeader />
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<Assets />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="users" element={<Users />} />
          <Route path="news" element={<News />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="security" element={<Security />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
