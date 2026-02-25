import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import { getToken } from "./Services/auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5149";
const DEFAULT_PROFILE_PICTURE = `${API_BASE}/OIP.webp`;

const resolveProfileImageUrl = (value) => {
  if (!value) {
    return DEFAULT_PROFILE_PICTURE;
  }

  if (value.startsWith("data:image/") || /^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_BASE}${value}`;
  }

  return value;
};

export default function Faq() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [questionText, setQuestionText] = useState("");
  const [questionImageUrl, setQuestionImageUrl] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [statusMessage, setStatusMessage] = useState("");

  const token = getToken();
  const isAuthenticated = Boolean(token);

  const loadFaqs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/faq?page=1&pageSize=20`);
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

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });

  const handleQuestionImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatusMessage("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage("Image is too large. Please choose one under 5MB.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setQuestionImageUrl(dataUrl);
      setStatusMessage("Image attached.");
    } catch (error) {
      setStatusMessage(error?.message || "Failed to process image.");
    }
  };

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
          questionImageUrl: questionImageUrl || null,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setQuestionText("");
      setQuestionImageUrl("");
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
        <h1 style={{ marginBottom: "16px" }}>Questions and Answers</h1>
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
            <div style={{ marginTop: "12px" }}>
              <label
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "#7f8cff",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Upload Screenshot
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQuestionImageChange}
                  style={{ display: "none" }}
                />
              </label>
              {questionImageUrl && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={questionImageUrl}
                    alt="Question attachment preview"
                    style={{ maxWidth: "260px", borderRadius: "10px", border: "1px solid #2c3454" }}
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => setQuestionImageUrl("")}
                      style={{ marginTop: "8px" }}
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              )}
            </div>
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
            const avatarFallback = (item.question || "Q").slice(0, 1).toUpperCase();
            const authorLabel = item.authorUserName || item.authorEmail || "Unknown author";
            const replyAuthorLabel = item.replyAuthorUserName || item.replyAuthorEmail || "Unknown replier";
            const replyAvatarFallback = replyAuthorLabel.slice(0, 1).toUpperCase();

            return (
              <div
                key={item.faqId}
                style={{ background: "#1a1d2e", padding: "18px", borderRadius: "12px", border: "1px solid #22283a" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "#2a2f4a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#7f8cff",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {item.authorProfilePictureUrl ? (
                      <img
                        src={resolveProfileImageUrl(item.authorProfilePictureUrl)}
                        alt="Author"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(event) => {
                          event.currentTarget.src = DEFAULT_PROFILE_PICTURE;
                        }}
                      />
                    ) : (
                      <img
                        src={DEFAULT_PROFILE_PICTURE}
                        alt="Default profile"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>{item.question}</h3>
                    <p style={{ margin: "4px 0 0", color: "#aaa", fontSize: "12px" }}>By: {authorLabel}</p>
                  </div>
                </div>
                <p style={{ color: "#7f8cff", fontSize: "13px", marginBottom: hasAnswer ? "10px" : "14px" }}>
                  Posted: {new Date(item.createdAt).toLocaleString()}
                </p>

                {item.questionImageUrl && (
                  <div style={{ marginBottom: hasAnswer ? "10px" : "14px" }}>
                    <img
                      src={item.questionImageUrl}
                      alt="Question attachment"
                      style={{ maxWidth: "320px", width: "100%", borderRadius: "10px", border: "1px solid #2c3454" }}
                    />
                  </div>
                )}

                {hasAnswer ? (
                  <div style={{ background: "#0d0f1a", padding: "12px", borderRadius: "10px", border: "1px solid #2c3454" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          background: "#2a2f4a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#7f8cff",
                          fontWeight: 700,
                          fontSize: "12px",
                          flexShrink: 0,
                        }}
                      >
                        {item.replyAuthorProfilePictureUrl ? (
                          <img
                            src={resolveProfileImageUrl(item.replyAuthorProfilePictureUrl)}
                            alt="Replier"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(event) => {
                              event.currentTarget.src = DEFAULT_PROFILE_PICTURE;
                            }}
                          />
                        ) : (
                          <img
                            src={DEFAULT_PROFILE_PICTURE}
                            alt="Default profile"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        )}
                      </div>
                      <div>
                        <p style={{ margin: 0, color: "#4dff88", fontWeight: 700 }}>Reply</p>
                        <p style={{ margin: "2px 0 0", color: "#aaa", fontSize: "12px" }}>By: {replyAuthorLabel}</p>
                      </div>
                    </div>
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
