import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import { getToken } from "./Services/auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5149";

export default function Faq() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [questionText, setQuestionText] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [statusMessage, setStatusMessage] = useState("");

  const token = getToken();
  const isAuthenticated = Boolean(token);

  const loadFaqs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/faq`);
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setStatusMessage(error?.message || "Failed to load FAQ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const submitQuestion = async (event) => {
    event.preventDefault();
    setStatusMessage("");

    if (!questionText.trim()) {
      setStatusMessage("Please enter a question.");
      return;
    }

    if (!isAuthenticated) {
      setStatusMessage("Please sign in to send a question.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/faq/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: questionText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setQuestionText("");
      setStatusMessage("Question submitted.");
      await loadFaqs();
    } catch (error) {
      setStatusMessage(error?.message || "Failed to submit question.");
    }
  };

  const submitReply = async (faqId) => {
    setStatusMessage("");

    const answer = (replyDrafts[faqId] || "").trim();
    if (!answer) {
      setStatusMessage("Please enter an answer before replying.");
      return;
    }

    if (!isAuthenticated) {
      setStatusMessage("Please sign in to reply.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/faq/${faqId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answer }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setReplyDrafts((prev) => ({ ...prev, [faqId]: "" }));
      setStatusMessage("Reply posted.");
      await loadFaqs();
    } catch (error) {
      setStatusMessage(error?.message || "Failed to post reply.");
    }
  };

  return (
    <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        <h1 style={{ marginBottom: "16px" }}>FAQ</h1>
        <p style={{ color: "#aaa", marginBottom: "20px" }}>
          Ask a question and help other users by replying to unanswered ones.
        </p>

        <div style={{ background: "#1a1d2e", padding: "20px", borderRadius: "12px", border: "1px solid #22283a", marginBottom: "20px" }}>
          <h3 style={{ marginTop: 0 }}>Ask a question</h3>
          <form onSubmit={submitQuestion}>
            <textarea
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              placeholder="Type your question here"
              rows={4}
              style={{
                width: "100%",
                borderRadius: "10px",
                border: "1px solid #2c3454",
                background: "#0d0f1a",
                color: "#fff",
                padding: "12px",
                marginTop: "8px",
                resize: "vertical",
              }}
            />
            <button type="submit" style={{ marginTop: "12px" }}>
              Send Question
            </button>
          </form>
          {!isAuthenticated && <p style={{ color: "#ffb36b", marginTop: "10px" }}>Sign in to post questions and replies.</p>}
        </div>

        {statusMessage && <p style={{ color: "#9aa3ff", marginBottom: "14px" }}>{statusMessage}</p>}

        <div style={{ display: "grid", gap: "14px" }}>
          {isLoading && <p>Loading questions...</p>}

          {!isLoading && items.length === 0 && (
            <div style={{ background: "#1a1d2e", padding: "18px", borderRadius: "12px", border: "1px solid #22283a" }}>
              No questions yet.
            </div>
          )}

          {!isLoading && items.map((item) => {
            const hasAnswer = Boolean(item.answer && item.answer.trim());

            return (
              <div
                key={item.faqId}
                style={{ background: "#1a1d2e", padding: "18px", borderRadius: "12px", border: "1px solid #22283a" }}
              >
                <h3 style={{ marginTop: 0, marginBottom: "8px" }}>{item.question}</h3>
                <p style={{ color: "#7f8cff", fontSize: "13px", marginBottom: hasAnswer ? "10px" : "14px" }}>
                  Posted: {new Date(item.createdAt).toLocaleString()}
                </p>

                {hasAnswer ? (
                  <div style={{ background: "#0d0f1a", padding: "12px", borderRadius: "10px", border: "1px solid #2c3454" }}>
                    <p style={{ margin: 0, color: "#4dff88", fontWeight: 700 }}>Reply</p>
                    <p style={{ marginTop: "8px", marginBottom: 0 }}>{item.answer}</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: "#ffb36b", marginTop: 0 }}>No reply yet.</p>
                    <textarea
                      value={replyDrafts[item.faqId] || ""}
                      onChange={(event) =>
                        setReplyDrafts((prev) => ({
                          ...prev,
                          [item.faqId]: event.target.value,
                        }))
                      }
                      placeholder="Write your reply"
                      rows={3}
                      style={{
                        width: "100%",
                        borderRadius: "10px",
                        border: "1px solid #2c3454",
                        background: "#0d0f1a",
                        color: "#fff",
                        padding: "10px",
                        resize: "vertical",
                      }}
                    />
                    <button onClick={() => submitReply(item.faqId)} style={{ marginTop: "10px" }}>
                      Reply to this question
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
