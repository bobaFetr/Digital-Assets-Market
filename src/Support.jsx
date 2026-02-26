import React, { useState } from "react";
import Sidebar from "./Components/Sidebar";

export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setStatus("Please fill subject and message.");
      return;
    }

    setStatus("Support request submitted.");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        <h1 style={{ marginBottom: "12px" }}>Support</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
          Contact support for account, trading, verification, or wallet issues.
        </p>

        <div style={{ background: "var(--card-bg)", padding: "20px", borderRadius: "12px", border: "1px solid var(--glass-border)", maxWidth: "700px" }}>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--panel-bg)", color: "var(--input-text)" }}
            />
            <textarea
              placeholder="Describe your issue"
              rows={6}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--panel-bg)", color: "var(--input-text)", resize: "vertical" }}
            />
            <button type="submit" style={{ width: "fit-content", padding: "10px 14px", borderRadius: "8px", border: "none", background: "#7f8cff", color: "#fff", cursor: "pointer" }}>
              Send to Support
            </button>
          </form>
          {status && <p style={{ marginTop: "12px", color: "#9aa3ff" }}>{status}</p>}
        </div>
      </div>
    </div>
  );
}
