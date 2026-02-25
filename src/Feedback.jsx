import React, { useState } from "react";
import Sidebar from "./Components/Sidebar";

export default function Feedback() {
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!comment.trim()) {
      setStatus("Please add your feedback comment.");
      return;
    }

    setStatus("Thank you for your feedback.");
    setRating("5");
    setComment("");
  };

  return (
    <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        <h1 style={{ marginBottom: "12px" }}>Feedback</h1>
        <p style={{ color: "#aaa", marginBottom: "20px" }}>
          Share your experience and help improve the platform.
        </p>

        <div style={{ background: "#1a1d2e", padding: "20px", borderRadius: "12px", border: "1px solid #22283a", maxWidth: "700px" }}>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
            <label style={{ display: "grid", gap: "6px" }}>
              <span>Rating</span>
              <select
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #3c415f", background: "#0f1220", color: "#fff" }}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Very poor</option>
              </select>
            </label>
            <textarea
              placeholder="Your feedback"
              rows={6}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #3c415f", background: "#0f1220", color: "#fff", resize: "vertical" }}
            />
            <button type="submit" style={{ width: "fit-content", padding: "10px 14px", borderRadius: "8px", border: "none", background: "#7f8cff", color: "#fff", cursor: "pointer" }}>
              Submit Feedback
            </button>
          </form>
          {status && <p style={{ marginTop: "12px", color: "#9aa3ff" }}>{status}</p>}
        </div>
      </div>
    </div>
  );
}
