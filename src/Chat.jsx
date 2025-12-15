import React, { useState } from "react";

const contacts = [
  { id: 1, name: "Ava Carter", status: "online", accent: "#FF6B6B" },
  { id: 2, name: "Noah King", status: "last seen 5m ago", accent: "#4ECDC4" },
  { id: 3, name: "Mia Flores", status: "typing…", accent: "#A78BFA" },
  { id: 4, name: "Leo Park", status: "offline", accent: "#FB923C" },
];

const initialConversations = {
  1: [
    { id: 1, fromMe: false, text: "Morning! How’s the release?", time: "09:12" },
    { id: 2, fromMe: true, text: "Almost ready, just polishing UI.", time: "09:13" },
    { id: 3, fromMe: false, text: "Awesome. Ping me when live.", time: "09:14" },
  ],
  2: [{ id: 1, fromMe: false, text: "Slides look great btw.", time: "07:55" }],
  3: [],
  4: [
    { id: 1, fromMe: true, text: "We need that dataset?", time: "21:31" },
    { id: 2, fromMe: false, text: "Uploading in 10min.", time: "21:32" },
  ],
};

export default function Chat() {
  const [activeContact, setActiveContact] = useState(contacts[0]);
  const [conversations, setConversations] = useState(initialConversations);
  const [draft, setDraft] = useState("");

  const currentMessages = conversations[activeContact.id] ?? [];

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const newMessage = {
      id: Date.now(),
      fromMe: true,
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setConversations((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] ?? []), newMessage],
    }));
    setDraft("");
  };

  const onEnterPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const renderLastMessage = (id) => {
    const msgs = conversations[id] ?? [];
    if (msgs.length === 0) return "Start a conversation";
    const last = msgs[msgs.length - 1];
    return (last.fromMe ? "You: " : "") + (last.text.length > 30 ? last.text.slice(0, 27) + "..." : last.text);
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0f1a", color: "#fff", fontFamily: "Arial" }}>
      {/* Left Sidebar (matches App.jsx) */}
      <aside style={{ width: "220px", background: "#11131f", padding: "20px" }}>
        <h2 style={{ marginBottom: "20px" }}>CryptoMatrix</h2>
        <nav>
          {[
            "Crypto Currencies",
            "Businesses",
            "Pay",
            "Wallet",
            "More",
            "Data API",
            "Stacking Calculator",
            "Profile Settings",
          ].map((item) => (
            <div key={item} style={{ padding: "12px 0", opacity: 0.7, cursor: "pointer" }}>
              {item}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Chat Column */}
      <div style={{ flex: 1, padding: "20px", overflow: "hidden", display: "flex", gap: "20px" }}>
        {/* Chat List Panel */}
        <div
          style={{
            width: "320px",
            background: "#1a1d2e",
            padding: "16px",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>Chats</h3>
            <button
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                border: "none",
                background: "#7f8cff",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              +
            </button>
          </div>

          <input
            placeholder="Search or start new chat"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #22283a",
              background: "#11131f",
              color: "#fff",
              outline: "none",
            }}
          />

          <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  background: contact.id === activeContact.id ? "#2a2f45" : "#11131f",
                  color: "#fff",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    background: contact.accent,
                    color: "#0d0f1a",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {contact.name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ fontWeight: 600 }}>{contact.name}</span>
                    <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                      {conversations[contact.id]?.slice(-1)[0]?.time ?? ""}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: "4px",
                      color: "#cbd5f5",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {renderLastMessage(contact.id)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Panel */}
        <div
          style={{
            flex: 1,
            background: "#1a1d2e",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px",
              borderBottom: "1px solid #22283a",
              background: "#16192a",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                background: activeContact.accent,
                color: "#0d0f1a",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {activeContact.name[0]}
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 600 }}>{activeContact.name}</div>
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>{activeContact.status}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
              {["📞", "🎥", "⋮"].map((icon) => (
                <button
                  key={icon}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#11131f",
                    color: "#cbd5f5",
                    cursor: "pointer",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "18px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "#13162b",
            }}
          >
            {currentMessages.length === 0 && (
              <div style={{ margin: "auto", color: "#94a3b8", fontSize: "14px" }}>
                Start a conversation with {activeContact.name}.
              </div>
            )}

            {currentMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: msg.fromMe ? "flex-end" : "flex-start",
                  gap: "10px",
                  alignItems: "flex-end",
                }}
              >
                {!msg.fromMe && (
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "10px",
                      background: activeContact.accent,
                      color: "#0d0f1a",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {activeContact.name[0]}
                  </div>
                )}
                <div style={{ maxWidth: "60%", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "14px",
                      borderBottomRightRadius: msg.fromMe ? "4px" : "14px",
                      borderBottomLeftRadius: msg.fromMe ? "14px" : "4px",
                      background: msg.fromMe ? "#7f8cff" : "#0f1224",
                      color: "#fff",
                      lineHeight: 1.4,
                    }}
                  >
                    {msg.text}
                  </div>
                  <span style={{ fontSize: "11px", color: "#94a3b8", alignSelf: "flex-end" }}>{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              padding: "14px 16px",
              borderTop: "1px solid #22283a",
              background: "#16192a",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onEnterPress}
              placeholder={`Message ${activeContact.name}`}
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                border: "1px solid #22283a",
                borderRadius: "10px",
                padding: "10px 12px",
                background: "#0f1224",
                color: "#fff",
                outline: "none",
                minHeight: "42px",
              }}
            />
            <button
              onClick={handleSend}
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: "10px",
                background: "#7f8cff",
                color: "#0d0f1a",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar (summary) */}
      <aside
        style={{
          width: "280px",
          background: "#11131f",
          padding: "20px",
          borderLeft: "1px solid #222",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>Chat Summary</h3>
          <p style={{ marginTop: "8px", color: "#9ca3af" }}>
            Active: {activeContact.name}
          </p>
          <p style={{ margin: "4px 0", color: "#9ca3af" }}>
            Status: {activeContact.status}
          </p>
        </div>

        <div style={{ background: "#1a1d2e", padding: "14px", borderRadius: "10px" }}>
          <h4 style={{ margin: "0 0 8px" }}>Recent contacts</h4>
          {contacts.slice(0, 3).map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                borderBottom: "1px solid #22283a",
                fontSize: "13px",
              }}
            >
              <span>{c.name}</span>
              <span style={{ color: "#94a3b8" }}>{c.status}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}