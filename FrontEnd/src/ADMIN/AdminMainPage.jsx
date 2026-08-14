import React, { useEffect, useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import "./Admin.css";
import UserSidebar from "../Components/Sidebar";
import { getToken, request } from "../Services/Service";

/* ===== Pages ===== */

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
          Authorization: `Bearer ${token}`
        }
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
  const resolveIdentifierPayload = value => {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error("Provide a user id or email.");
    }
    if (trimmed.includes("@")) {
      return {
        email: trimmed
      };
    }
    const guidPattern = /^[0-9a-fA-F-]{36}$/;
    if (!guidPattern.test(trimmed)) {
      throw new Error("Enter a valid GUID or email address.");
    }
    return {
      id: trimmed
    };
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
      const payload = directId ? {
        id: value
      } : resolveIdentifierPayload(value);
      await request(`/api/users/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      setStatusMessage(`User ${action === "ban" ? "banned" : "unbanned"}.`);
      setIdentifier("");
      await loadUsers(statusFilter);
    } catch (actionError) {
      setError(actionError?.message || "Action failed.");
    }
  };
  const handleRowAction = async user => {
    setActionUserId(user.id);
    await runUserAction(user.isBanned ? "unban" : "ban", user.id, true);
    setActionUserId("");
  };
  const userCountLabel = statusFilter === "all" ? "Total" : statusFilter === "banned" ? "Banned" : "Active";
  return <div className="admin-page">
      <div className="page-header">
        <h2>Users</h2>
        <div className="inline-actions">
          <button className={`btn btn-ghost ${statusFilter === "active" ? "filter-active" : ""}`} onClick={() => setStatusFilter("active")}>

            Active
          </button>
          <button className={`btn btn-ghost ${statusFilter === "banned" ? "filter-active" : ""}`} onClick={() => setStatusFilter("banned")}>

            Banned
          </button>
          <button className={`btn btn-ghost ${statusFilter === "all" ? "filter-active" : ""}`} onClick={() => setStatusFilter("all")}>

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
        <form className="user-action-form" onSubmit={event => {
        event.preventDefault();
        runUserAction("ban", identifier);
      }}>

          <input type="text" placeholder="User id or email" value={identifier} onChange={event => setIdentifier(event.target.value)} />

          <button className="btn btn-ghost" type="submit">
            Ban
          </button>
          <button className="btn btn-primary" type="button" onClick={() => runUserAction("unban", identifier)}>

            Unban
          </button>
        </form>
        {(error || statusMessage) && <div className="user-action-status">
            {error && <span className="badge danger">{error}</span>}
            {!error && statusMessage && <span className="badge success">{statusMessage}</span>}
          </div>}
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
          {users.map(user => <div className="table-row" key={user.id}>
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
                <button className={`btn ${user.isBanned ? "btn-primary" : "btn-ghost"}`} onClick={() => handleRowAction(user)} disabled={actionUserId === user.id}>

                  {user.isBanned ? "Unban" : "Ban"}
                </button>
              </span>
            </div>)}
          {!isLoading && users.length === 0 && <div className="table-row empty-row">
              <span>No users found.</span>
            </div>}
        </div>
      </div>
    </div>;
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
  const handleSubmit = async event => {
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
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null
      };
      const created = await request(`/api/news`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      setItems(prev => [created, ...prev]);
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
  return <div className="admin-page">
      <div className="page-header">
        <h2>Newsroom</h2>
      </div>
      <div className="panel">
        <div className="panel-header">
          <h3>Create news</h3>
        </div>
        {error && <div className="login-alert">{error}</div>}
        {status && <div className="login-alert">{status}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Title
            <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Headline" />
          </label>
          <label>
            Content
            <textarea value={content} onChange={event => setContent(event.target.value)} placeholder="Write the news update..." rows={4} />

          </label>
          <label>
            Publish date (optional)
            <input type="datetime-local" value={publishedAt} onChange={event => setPublishedAt(event.target.value)} />
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
          {items.map(item => <article key={item.newsId || item.title} className="info-card">
              <h4>{item.title}</h4>
              <p>{item.content}</p>
              <span className="time">{formatAdminDate(item.publishedAt)}</span>
            </article>)}
        </div>
      </div>
    </div>;
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
  const handleCreateFaq = async event => {
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim()
        })
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
  const beginEdit = item => {
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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question: editQuestion.trim(),
          answer: editAnswer
        })
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
  const deleteFaq = async faqId => {
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
          Authorization: `Bearer ${token}`
        }
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
  return <div className="admin-page">
      <div className="page-header">
        <h2>FAQs</h2>
        <button className="btn btn-primary" onClick={loadFaqs}>Refresh</button>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Create FAQ</h3>
        </div>
        {error && <div className="login-alert">{error}</div>}
        {status && <div className="login-alert">{status}</div>}
        <form onSubmit={handleCreateFaq} className="login-form">
          <label>
            Question
            <input value={question} onChange={event => setQuestion(event.target.value)} placeholder="FAQ question" />
          </label>
          <label>
            Answer (optional)
            <textarea value={answer} onChange={event => setAnswer(event.target.value)} placeholder="FAQ answer" rows={4} />

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
          {items.map(item => <article key={item.faqId} className="info-card">
              {editingId === item.faqId ? <>
                  <input value={editQuestion} onChange={event => setEditQuestion(event.target.value)} placeholder="Question" />


                  <textarea value={editAnswer} onChange={event => setEditAnswer(event.target.value)} placeholder="Answer" rows={4} />

                  <div className="inline-actions">
                    <button className="btn btn-primary" onClick={saveEdit} disabled={isSavingEdit}>
                      {isSavingEdit ? "Saving..." : "Save"}
                    </button>
                    <button className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
                  </div>
                </> : <>
                  <h4>{item.question}</h4>
                  <p>{item.answer || "No answer yet."}</p>
                  <span className="time">Updated: {formatAdminDate(item.updatedAt)}</span>
                  <div className="inline-actions">
                    <button className="btn btn-ghost" onClick={() => beginEdit(item)}>Edit</button>
                    <button className="btn btn-primary" onClick={() => deleteFaq(item.faqId)} disabled={deletingId === item.faqId}>

                      {deletingId === item.faqId ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>}
            </article>)}
        </div>
      </div>
    </div>;
};
/* ===== Sidebar ===== */
function Sidebar() {
  return <aside className="admin-sidebar">
      <div className="admin-brand">
        <div>
          <p className="eyebrow">Digital Market</p>
          <h2>Admin Suite</h2>
        </div>
      </div>
      <div className="admin-section">
        <p className="section-title">Core</p>
        <NavLink className="nav-link" to="/Admin" end>Users</NavLink>
        <NavLink className="nav-link" to="/Admin/users">Users</NavLink>
      </div>
      <div className="admin-section">
        <p className="section-title">Content</p>
        <NavLink className="nav-link" to="/Admin/news">Newsroom</NavLink>
        <NavLink className="nav-link" to="/Admin/faqs">FAQs</NavLink>
      </div>
    </aside>;
}
/* ===== Admin Layout ===== */
export default function Admin({
  mobileOpen,
  setMobileOpen
}) {
  return <div className="admin-shell admin-shell--dual">
      <div className="admin-backdrop" />
      <div className="admin-user-sidebar">
        <UserSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      </div>
      <Sidebar />
      <main className="admin-content">
        <Routes>
          <Route index element={<Users />} />
          <Route path="users" element={<Users />} />
          <Route path="news" element={<News />} />
          <Route path="faqs" element={<Faqs />} />
        </Routes>
      </main>
    </div>;
}
const formatAdminDate = value => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};
