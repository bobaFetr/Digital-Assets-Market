import React, { useState } from "react";
import "./Chat.css"; // create this file with the styles below

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
    <div className="chat-shell">
      {/* Left: chat list */}
      <aside className="chat-list">
        <div className="chat-list-header">
          <h1>Chats</h1>
          <button className="new-chat-button">+</button>
        </div>
        <input className="chat-search" placeholder="Search or start new chat" />

        <div className="chat-list-items">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              className={`chat-list-item ${contact.id === activeContact.id ? "active" : ""}`}
              onClick={() => setActiveContact(contact)}
            >
              <div className="contact-avatar" style={{ backgroundColor: contact.accent }}>
                {contact.name[0]}
              </div>
              <div className="contact-info">
                <div className="contact-row">
                  <span className="contact-name">{contact.name}</span>
                  <span className="contact-time">
                    {conversations[contact.id]?.slice(-1)[0]?.time ?? ""}
                  </span>
                </div>
                <span className="contact-preview">{renderLastMessage(contact.id)}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Right: conversation */}
      <section className="chat-room">
        <header className="chat-room-header">
          <div className="contact-avatar large" style={{ backgroundColor: activeContact.accent }}>
            {activeContact.name[0]}
          </div>
          <div className="chat-room-title">
            <h2>{activeContact.name}</h2>
            <span>{activeContact.status}</span>
          </div>
          <div className="chat-room-actions">
            <button>📞</button>
            <button>🎥</button>
            <button>⋮</button>
          </div>
        </header>

        <div className="chat-room-messages">
          {currentMessages.length === 0 && (
            <div className="empty-state">
              Start a conversation with {activeContact.name}.
            </div>
          )}
          {currentMessages.map((msg) => (
            <div key={msg.id} className={`message-row ${msg.fromMe ? "me" : "other"}`}>
              {!msg.fromMe && (
                <div className="contact-avatar tiny" style={{ backgroundColor: activeContact.accent }}>
                  {activeContact.name[0]}
                </div>
              )}
              <div className="bubble-group">
                <div className={`message-bubble ${msg.fromMe ? "me" : "other"}`}>
                  {msg.text}
                </div>
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        <footer className="chat-room-input">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onEnterPress}
            placeholder={`Message ${activeContact.name}`}
            rows={1}
          />
          <button onClick={handleSend}>Send</button>
        </footer>
      </section>
    </div>
  );
}