import React, { useEffect, useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import "./Admin.css";
import UserSidebar from "../Components/Sidebar";
import { getToken, request } from "../Services/auth";

const API_BASE = import.meta.env?.VITE_API_BASE ?? "";

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
  <div className="admin-page" style={{ background: '#181a20', color: '#fff', minHeight: '100vh' }}>
    <section className="hero-panel" style={{ background: '#23263a', borderRadius: 16, padding: 32, marginBottom: 32, boxShadow: '0 2px 8px #181a20' }}>
      <div>
        <p className="eyebrow" style={{ color: '#ff7f50', fontWeight: 600 }}>Operations Overview</p>
        <h1 style={{ color: '#ff7f50' }}>Command Center</h1>
        <p className="hero-subtext" style={{ color: '#fff' }}>
          Live market health, compliance queue, and revenue signals in one place.
        </p>
        <div className="hero-actions" style={{ marginTop: 16 }}>
          <button className="btn btn-primary" style={{ background: '#ff7f50', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, marginRight: 12 }}>Open Incident Room</button>
          <button className="btn btn-ghost" style={{ background: 'transparent', color: '#ff7f50', border: '1px solid #ff7f50', borderRadius: 8, fontWeight: 600 }}>Generate Ops Report</button>
        </div>
      </div>
      <div className="hero-status" style={{ display: 'flex', gap: 32 }}>
        <div>
          <p className="label" style={{ color: '#ff7f50' }}>System Status</p>
          <h3 style={{ color: '#7cf29a' }}>All systems stable</h3>
        </div>
        <div>
          <p className="label" style={{ color: '#ff7f50' }}>Latency</p>
          <h3 style={{ color: '#fff' }}>142ms</h3>
        </div>
        <div>
          <p className="label" style={{ color: '#ff7f50' }}>Alerts</p>
          <h3 style={{ color: '#fff' }}>2 active</h3>
        </div>
      </div>
    </section>

    <section className="metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 32 }}>
      {quickMetrics.map((metric) => (
        <article key={metric.label} className={`metric-card tone-${metric.tone}`}
          style={{ background: '#23263a', borderRadius: 12, padding: 18, color: '#fff', boxShadow: '0 2px 8px #181a20' }}>
          <p className="label" style={{ color: '#ff7f50', fontWeight: 600 }}>{metric.label}</p>
          <h3 style={{ color: '#fff' }}>{metric.value}</h3>
          <span className="chip" style={{ color: metric.tone === 'success' ? '#7cf29a' : metric.tone === 'danger' ? '#ff4d4d' : metric.tone === 'warning' ? '#ffd700' : '#ff7f50', fontWeight: 600 }}>{metric.trend}</span>
        </article>
      ))}
    </section>

    <section className="split-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
      <article className="panel" style={{ background: '#23263a', borderRadius: 12, padding: 18, color: '#fff', boxShadow: '0 2px 8px #181a20' }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#ff7f50' }}>Live Activity</h3>
          <button className="btn btn-ghost" style={{ background: 'transparent', color: '#ff7f50', border: '1px solid #ff7f50', borderRadius: 8, fontWeight: 600 }}>View all</button>
        </div>
        <div className="activity-list">
          {activityFeed.map((item) => (
            <div key={item.title} className={`activity-card tone-${item.tone}`}
              style={{ background: '#181a20', borderRadius: 8, marginBottom: 12, padding: 12, color: '#fff', borderLeft: `4px solid ${item.tone === 'success' ? '#7cf29a' : item.tone === 'danger' ? '#ff4d4d' : item.tone === 'warning' ? '#ffd700' : '#ff7f50'}` }}>
              <div>
                <h4>{item.title}</h4>
                <p>{item.meta}</p>
              </div>
              <span className="time" style={{ color: '#ff7f50', fontWeight: 600 }}>{item.time}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel" style={{ background: '#23263a', borderRadius: 12, padding: 18, color: '#fff', boxShadow: '0 2px 8px #181a20' }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#ff7f50' }}>KYC Review Queue</h3>
          <button className="btn btn-ghost" style={{ background: 'transparent', color: '#ff7f50', border: '1px solid #ff7f50', borderRadius: 8, fontWeight: 600 }}>Open queue</button>
        </div>
        <div className="table user-table" style={{ color: '#fff' }}>
          <div className="table-row table-head" style={{ background: '#181a20', color: '#ff7f50', fontWeight: 600 }}>
            <span>User</span>
            <span>Tier</span>
            <span>Risk</span>
            <span>Wait</span>
          </div>
          {kycQueue.map((row) => (
            <div className="table-row" key={row.name} style={{ background: '#23263a', color: '#fff' }}>
              <span>{row.name}</span>
              <span>{row.tier}</span>
              <span style={{ color: row.risk === 'High' ? '#ff4d4d' : row.risk === 'Medium' ? '#ffd700' : '#7cf29a' }}>{row.risk}</span>
              <span>{row.time}</span>
            </div>
          ))}
        </div>
      </article>
    </section>

    <section className="wide-panel" style={{ background: '#23263a', borderRadius: 12, padding: 18, color: '#fff', boxShadow: '0 2px 8px #181a20', marginBottom: 32 }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#ff7f50' }}>Top Assets</h3>
        <button className="btn btn-ghost" style={{ background: 'transparent', color: '#ff7f50', border: '1px solid #ff7f50', borderRadius: 8, fontWeight: 600 }}>Manage listings</button>
      </div>
      <div className="table">
        <div className="table-row table-head" style={{ background: '#181a20', color: '#ff7f50', fontWeight: 600 }}>
          <span>Asset</span>
          <span>Price</span>
          <span>Change</span>
          <span>24h Volume</span>
        </div>
        {topAssets.map((asset) => (
          <div className="table-row" key={asset.symbol} style={{ background: '#23263a', color: '#fff' }}>
            <span>{asset.symbol}</span>
            <span>{asset.price}</span>
            <span style={{ color: asset.change.startsWith('+') ? '#7cf29a' : '#ff4d4d' }}>{asset.change}</span>
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
      <h2 style={{ color: '#ff7f50' }}>Assets</h2>
      <button className="btn btn-primary" style={{ background: '#ff7f50', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>Add Listing</button>
    </div>
    <div className="panel" style={{ background: '#23263a', borderRadius: 12, color: '#fff', boxShadow: '0 2px 8px #181a20' }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#ff7f50' }}>Listings</h3>
        <button className="btn btn-ghost" style={{ background: 'transparent', color: '#ff7f50', border: '1px solid #ff7f50', borderRadius: 8, fontWeight: 600 }}>Export</button>
      </div>
      <div className="table">
        <div className="table-row table-head" style={{ background: '#181a20', color: '#ff7f50', fontWeight: 600 }}>
          <span>Symbol</span>
          <span>Network</span>
          <span>Status</span>
          <span>Liquidity</span>
        </div>
        {topAssets.map((asset) => (
          <div className="table-row" key={asset.symbol} style={{ background: '#23263a', color: '#fff' }}>
            <span>{asset.symbol}</span>
            <span>Primary</span>
            <span className="badge success" style={{ background: '#ff7f50', color: '#fff', borderRadius: 6, padding: '2px 10px', fontWeight: 600 }}>Active</span>
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
      <h2 style={{ color: '#ff7f50' }}>Transactions</h2>
      <div className="inline-actions">
        <button className="btn btn-ghost" style={{ background: 'transparent', color: '#ff7f50', border: '1px solid #ff7f50', borderRadius: 8, fontWeight: 600 }}>Filters</button>
        <button className="btn btn-primary" style={{ background: '#ff7f50', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>Flag Review</button>
      </div>
    </div>
    <div className="panel" style={{ background: '#23263a', borderRadius: 12, color: '#fff', boxShadow: '0 2px 8px #181a20' }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#ff7f50' }}>Recent</h3>
        <button className="btn btn-ghost" style={{ background: 'transparent', color: '#ff7f50', border: '1px solid #ff7f50', borderRadius: 8, fontWeight: 600 }}>Export</button>
      </div>
      <div className="table">
        <div className="table-row table-head" style={{ background: '#181a20', color: '#ff7f50', fontWeight: 600 }}>
          <span>Transaction</span>
          <span>User</span>
          <span>Type</span>
          <span>Asset</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        {recentTransactions.map((tx) => (
          <div className="table-row" key={tx.id} style={{ background: '#23263a', color: '#fff' }}>
            <span>{tx.id}</span>
            <span>{tx.user}</span>
            <span>{tx.type}</span>
            <span>{tx.asset}</span>
            <span>{tx.amount}</span>
            <span className={`badge ${tx.status === "Completed" ? "success" : tx.status === "Review" ? "warning" : "danger"}`} style={{ background: tx.status === 'Completed' ? '#7cf29a' : tx.status === 'Review' ? '#ffd700' : '#ff4d4d', color: '#23263a', borderRadius: 6, padding: '2px 10px', fontWeight: 600 }}>
              {tx.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Users = () => {
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionUserId, setActionUserId] = useState("");

  const loadUsers = async (nextStatus = statusFilter) => {
    const token = getToken();
    if (!token) {
      setError("Admin authentication required.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const query = nextStatus === "all" ? "" : `?status=${nextStatus}`;
      const data = await request(`/api/users${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError?.message || "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(statusFilter);
  }, [statusFilter]);

  const resolveIdentifierPayload = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error("Provide a user id or email.");
    }

    if (trimmed.includes("@")) {
      return { email: trimmed };
    }

    const guidPattern = /^[0-9a-fA-F-]{36}$/;
    if (!guidPattern.test(trimmed)) {
      throw new Error("Enter a valid GUID or email address.");
    }

    return { id: trimmed };
  };

  const runUserAction = async (action, value, directId = false) => {
    const token = getToken();
    if (!token) {
      setError("Admin authentication required.");
      return;
    }

    setError("");
    setStatusMessage("");

    try {
      const payload = directId ? { id: value } : resolveIdentifierPayload(value);
      await request(`/api/users/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      setStatusMessage(`User ${action === "ban" ? "banned" : "unbanned"}.`);
      setIdentifier("");
      await loadUsers(statusFilter);
    } catch (actionError) {
      setError(actionError?.message || "Action failed.");
    }
  };

  const handleRowAction = async (user) => {
    setActionUserId(user.id);
    await runUserAction(user.isBanned ? "unban" : "ban", user.id, true);
    setActionUserId("");
  };

  const userCountLabel = statusFilter === "all" ? "Total" : statusFilter === "banned" ? "Banned" : "Active";

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Users</h2>
        <div className="inline-actions">
          <button
            className={`btn btn-ghost ${statusFilter === "active" ? "filter-active" : ""}`}
            onClick={() => setStatusFilter("active")}
          >
            Active
          </button>
          <button
            className={`btn btn-ghost ${statusFilter === "banned" ? "filter-active" : ""}`}
            onClick={() => setStatusFilter("banned")}
          >
            Banned
          </button>
          <button
            className={`btn btn-ghost ${statusFilter === "all" ? "filter-active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>
          <button className="btn btn-primary" onClick={() => loadUsers(statusFilter)}>
            Refresh
          </button>
        </div>
      </div>

      <div className="panel user-actions">
        <div>
          <p className="label">{userCountLabel} users</p>
          <h3>{users.length}</h3>
        </div>
        <form
          className="user-action-form"
          onSubmit={(event) => {
            event.preventDefault();
            runUserAction("ban", identifier);
          }}
        >
          <input
            type="text"
            placeholder="User id or email"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
          />
          <button className="btn btn-ghost" type="submit">
            Ban
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => runUserAction("unban", identifier)}
          >
            Unban
          </button>
        </form>
        {(error || statusMessage) && (
          <div className="user-action-status">
            {error && <span className="badge danger">{error}</span>}
            {!error && statusMessage && <span className="badge success">{statusMessage}</span>}
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Directory</h3>
          <span className="label">{isLoading ? "Loading..." : `${users.length} records`}</span>
        </div>
        <div className="table">
          <div className="table-row table-head">
            <span>User</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Device</span>
            <span>IP</span>
            <span>Last Seen</span>
            <span>Joined</span>
            <span>Action</span>
          </div>
          {users.map((user) => (
            <div className="table-row" key={user.id}>
              <span>{user.userName || "-"}</span>
              <span>{user.email}</span>
              <span>{user.role}</span>
              <span className={`badge ${user.isBanned ? "danger" : "success"}`}>
                {user.isBanned ? "Banned" : "Active"}
              </span>
              <span>{user.lastDeviceInfo || "-"}</span>
              <span>{user.lastIpAddress || "-"}</span>
              <span>{user.lastSeenAt ? new Date(user.lastSeenAt).toLocaleString() : "-"}</span>
              <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</span>
              <span>
                <button
                  className={`btn ${user.isBanned ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => handleRowAction(user)}
                  disabled={actionUserId === user.id}
                >
                  {user.isBanned ? "Unban" : "Ban"}
                </button>
              </span>
            </div>
          ))}
          {!isLoading && users.length === 0 && (
            <div className="table-row empty-row">
              <span>No users found.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const News = () => {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;
    const loadNews = async () => {
      try {
        const data = await request(`/api/news`);
        if (!isActive) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (!isActive) return;
        setError(fetchError?.message || "Failed to load news.");
      }
    };

    loadNews();
    return () => {
      isActive = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Please sign in as admin to add news.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
      };

      const created = await request(`/api/news`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      setItems((prev) => [created, ...prev]);
      setTitle("");
      setContent("");
      setPublishedAt("");
      setStatus("News item published.");
    } catch (submitError) {
      setError(submitError?.message || "Failed to publish news.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Newsroom</h2>
      </div>
      <div className="panel" style={{ marginBottom: "24px" }}>
        <div className="panel-header">
          <h3>Create news</h3>
        </div>
        {error && <div className="login-alert" style={{ marginBottom: "12px" }}>{error}</div>}
        {status && <div className="login-alert" style={{ marginBottom: "12px", color: "#4dff88" }}>{status}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Headline" />
          </label>
          <label>
            Content
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write the news update..."
              rows={4}
            />
          </label>
          <label>
            Publish date (optional)
            <input type="datetime-local" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} />
          </label>
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Publishing..." : "Publish news"}
          </button>
        </form>
      </div>
      <div className="panel">
        <div className="panel-header">
          <h3>Published news</h3>
        </div>
        <div className="cards-grid">
          {items.map((item) => (
            <article key={item.newsId || item.title} className="info-card">
              <h4>{item.title}</h4>
              <p>{item.content}</p>
              <span className="time">{formatAdminDate(item.publishedAt)}</span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

const Faqs = () => {
  const [items, setItems] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const loadFaqs = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await request(`/api/faq`);
      setItems(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError?.message || "Failed to load FAQs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleCreateFaq = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!question.trim()) {
      setError("Question is required.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Admin authentication required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await request(`/api/faq`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
        }),
      });

      setQuestion("");
      setAnswer("");
      setStatus("FAQ created.");
      await loadFaqs();
    } catch (submitError) {
      setError(submitError?.message || "Failed to create FAQ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const beginEdit = (item) => {
    setEditingId(item.faqId);
    setEditQuestion(item.question || "");
    setEditAnswer(item.answer || "");
    setError("");
    setStatus("");
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditQuestion("");
    setEditAnswer("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setError("");
    setStatus("");

    if (!editQuestion.trim()) {
      setError("Question is required.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("Admin authentication required.");
      return;
    }

    setIsSavingEdit(true);
    try {
      await request(`/api/faq/${editingId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: editQuestion.trim(),
          answer: editAnswer,
        }),
      });

      setStatus("FAQ updated.");
      cancelEdit();
      await loadFaqs();
    } catch (updateError) {
      setError(updateError?.message || "Failed to update FAQ.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const deleteFaq = async (faqId) => {
    const shouldDelete = window.confirm("Delete this FAQ?");
    if (!shouldDelete) return;

    const token = getToken();
    if (!token) {
      setError("Admin authentication required.");
      return;
    }

    setError("");
    setStatus("");
    setDeletingId(faqId);

    try {
      await request(`/api/faq/${faqId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (editingId === faqId) {
        cancelEdit();
      }

      setStatus("FAQ deleted.");
      await loadFaqs();
    } catch (deleteError) {
      setError(deleteError?.message || "Failed to delete FAQ.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>FAQs</h2>
        <button className="btn btn-primary" onClick={loadFaqs}>Refresh</button>
      </div>

      <div className="panel" style={{ marginBottom: "24px" }}>
        <div className="panel-header">
          <h3>Create FAQ</h3>
        </div>
        {error && <div className="login-alert" style={{ marginBottom: "12px" }}>{error}</div>}
        {status && <div className="login-alert" style={{ marginBottom: "12px", color: "#4dff88" }}>{status}</div>}
        <form onSubmit={handleCreateFaq} className="login-form">
          <label>
            Question
            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="FAQ question" />
          </label>
          <label>
            Answer (optional)
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="FAQ answer"
              rows={4}
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create FAQ"}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Manage FAQs</h3>
          <span className="label">{isLoading ? "Loading..." : `${items.length} records`}</span>
        </div>

        <div className="cards-grid">
          {!isLoading && items.length === 0 && <p>No FAQs found.</p>}
          {items.map((item) => (
            <article key={item.faqId} className="info-card">
              {editingId === item.faqId ? (
                <>
                  <input
                    value={editQuestion}
                    onChange={(event) => setEditQuestion(event.target.value)}
                    placeholder="Question"
                    style={{ marginBottom: "10px" }}
                  />
                  <textarea
                    value={editAnswer}
                    onChange={(event) => setEditAnswer(event.target.value)}
                    placeholder="Answer"
                    rows={4}
                  />
                  <div className="inline-actions" style={{ marginTop: "10px" }}>
                    <button className="btn btn-primary" onClick={saveEdit} disabled={isSavingEdit}>
                      {isSavingEdit ? "Saving..." : "Save"}
                    </button>
                    <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h4>{item.question}</h4>
                  <p>{item.answer || "No answer yet."}</p>
                  <span className="time">Updated: {formatAdminDate(item.updatedAt)}</span>
                  <div className="inline-actions" style={{ marginTop: "10px" }}>
                    <button className="btn btn-ghost" onClick={() => beginEdit(item)}>Edit</button>
                    <button
                      className="btn btn-primary"
                      onClick={() => deleteFaq(item.faqId)}
                      disabled={deletingId === item.faqId}
                    >
                      {deletingId === item.faqId ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

const Announcements = () => (
  <div className="admin-page">
    <div className="page-header">
      <h2 style={{ color: '#ff7f50' }}>Announcements</h2>
      <button className="btn btn-primary" style={{ background: '#ff7f50', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>Draft</button>
    </div>
    <div className="panel" style={{ background: '#23263a', borderRadius: 12, color: '#fff', boxShadow: '0 2px 8px #181a20' }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#ff7f50' }}>Recent Broadcasts</h3>
        <button className="btn btn-ghost" style={{ background: 'transparent', color: '#ff7f50', border: '1px solid #ff7f50', borderRadius: 8, fontWeight: 600 }}>Schedule</button>
      </div>
      <div className="activity-list">
        {announcements.map((item) => (
          <div key={item.title} className="activity-card tone-info" style={{ background: '#181a20', borderLeft: '4px solid #ff7f50', borderRadius: 8, marginBottom: 12, padding: 12, color: '#fff' }}>
            <div>
              <h4 style={{ color: '#ff7f50' }}>{item.title}</h4>
              <p>{item.detail}</p>
            </div>
            <span className="time" style={{ color: '#ff7f50', fontWeight: 600 }}>Draft</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Security = () => (
  <div className="admin-page">
    <div className="page-header">
      <h2 style={{ color: '#ff7f50' }}>Security</h2>
      <button className="btn btn-primary" style={{ background: '#ff7f50', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>Run Audit</button>
    </div>
    <div className="split-grid">
      <article className="panel" style={{ background: '#23263a', borderRadius: 12, color: '#fff', boxShadow: '0 2px 8px #181a20' }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#ff7f50' }}>Active Policies</h3>
          <button className="btn btn-ghost" style={{ background: 'transparent', color: '#ff7f50', border: '1px solid #ff7f50', borderRadius: 8, fontWeight: 600 }}>Edit</button>
        </div>
        <div className="policy-list">
          <div>
            <h4 style={{ color: '#ff7f50' }}>Withdrawal Cooldown</h4>
            <p>Hold period: 30 minutes for high-risk accounts.</p>
          </div>
          <div>
            <h4 style={{ color: '#ff7f50' }}>Device Verification</h4>
            <p>Require new device approval on flagged IPs.</p>
          </div>
          <div>
            <h4 style={{ color: '#ff7f50' }}>AML Threshold</h4>
            <p>Auto-freeze over $100k within 15 minutes.</p>
          </div>
        </div>
      </article>
      <article className="panel" style={{ background: '#23263a', borderRadius: 12, color: '#fff', boxShadow: '0 2px 8px #181a20' }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#ff7f50' }}>Audit Trail</h3>
          <button className="btn btn-ghost" style={{ background: 'transparent', color: '#ff7f50', border: '1px solid #ff7f50', borderRadius: 8, fontWeight: 600 }}>View logs</button>
        </div>
        <div className="table">
          <div className="table-row table-head" style={{ background: '#181a20', color: '#ff7f50', fontWeight: 600 }}>
            <span>Event</span>
            <span>Actor</span>
            <span>Time</span>
          </div>
          <div className="table-row" style={{ background: '#23263a', color: '#fff' }}>
            <span>Policy update</span>
            <span>Admin-01</span>
            <span>Today, 09:22</span>
          </div>
          <div className="table-row" style={{ background: '#23263a', color: '#fff' }}>
            <span>New key rotation</span>
            <span>Security Bot</span>
            <span>Today, 02:14</span>
          </div>
          <div className="table-row" style={{ background: '#23263a', color: '#fff' }}>
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
      <h2 style={{ color: '#ff7f50' }}>Settings</h2>
      <button className="btn btn-primary" style={{ background: '#ff7f50', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>Save changes</button>
    </div>
    <div className="split-grid">
      <article className="panel" style={{ background: '#23263a', borderRadius: 12, color: '#fff', boxShadow: '0 2px 8px #181a20' }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#ff7f50' }}>Team</h3>
          <button className="btn btn-ghost" style={{ background: 'transparent', color: '#ff7f50', border: '1px solid #ff7f50', borderRadius: 8, fontWeight: 600 }}>Invite</button>
        </div>
        <div className="activity-list">
          <div className="activity-card tone-info" style={{ background: '#181a20', borderLeft: '4px solid #ff7f50', borderRadius: 8, marginBottom: 12, padding: 12, color: '#fff' }}>
            <div>
              <h4 style={{ color: '#ff7f50' }}>Alex Kim</h4>
              <p>Super Admin · Active</p>
            </div>
            <span className="time" style={{ color: '#ff7f50', fontWeight: 600 }}>Online</span>
          </div>
          <div className="activity-card tone-success" style={{ background: '#181a20', borderLeft: '4px solid #7cf29a', borderRadius: 8, marginBottom: 12, padding: 12, color: '#fff' }}>
            <div>
              <h4 style={{ color: '#7cf29a' }}>Maya Soto</h4>
              <p>Compliance Lead · Active</p>
            </div>
            <span className="time" style={{ color: '#7cf29a', fontWeight: 600 }}>2m</span>
          </div>
          <div className="activity-card tone-warning" style={{ background: '#181a20', borderLeft: '4px solid #ffd700', borderRadius: 8, marginBottom: 12, padding: 12, color: '#fff' }}>
            <div>
              <h4 style={{ color: '#ffd700' }}>Remy H.</h4>
              <p>Risk Analyst · Away</p>
            </div>
            <span className="time" style={{ color: '#ffd700', fontWeight: 600 }}>15m</span>
          </div>
        </div>
      </article>
      <article className="panel" style={{ background: '#23263a', borderRadius: 12, color: '#fff', boxShadow: '0 2px 8px #181a20' }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#ff7f50' }}>Notifications</h3>
          <button className="btn btn-ghost" style={{ background: 'transparent', color: '#ff7f50', border: '1px solid #ff7f50', borderRadius: 8, fontWeight: 600 }}>Configure</button>
        </div>
        <div className="notification-grid">
          <div className="toggle-card" style={{ background: '#181a20', borderRadius: 8, color: '#fff', marginBottom: 10 }}>
            <div>
              <h4 style={{ color: '#ff7f50' }}>Critical Alerts</h4>
              <p>Push + Slack</p>
            </div>
            <span className="chip" style={{ background: '#ff7f50', color: '#fff', borderRadius: 6, padding: '2px 10px', fontWeight: 600 }}>On</span>
          </div>
          <div className="toggle-card" style={{ background: '#181a20', borderRadius: 8, color: '#fff', marginBottom: 10 }}>
            <div>
              <h4 style={{ color: '#ff7f50' }}>KYC Updates</h4>
              <p>Email digest</p>
            </div>
            <span className="chip" style={{ background: '#ff7f50', color: '#fff', borderRadius: 6, padding: '2px 10px', fontWeight: 600 }}>Daily</span>
          </div>
          <div className="toggle-card" style={{ background: '#181a20', borderRadius: 8, color: '#fff', marginBottom: 10 }}>
            <div>
              <h4 style={{ color: '#ff7f50' }}>Market Shifts</h4>
              <p>SMS alert</p>
            </div>
            <span className="chip" style={{ background: '#ff7f50', color: '#fff', borderRadius: 6, padding: '2px 10px', fontWeight: 600 }}>On</span>
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
          <p className="eyebrow">Crypto Inc ЕООД</p>
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
        <NavLink className="nav-link" to="/Admin/faqs">FAQs</NavLink>
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
    <div className="admin-shell admin-shell--dual">
      <div className="admin-backdrop" />
      <div className="admin-user-sidebar">
        <UserSidebar />
      </div>
      <Sidebar />
      <main className="admin-content">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<Assets />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="users" element={<Users />} />
          <Route path="news" element={<News />} />
          <Route path="faqs" element={<Faqs />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="security" element={<Security />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

const formatAdminDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};
