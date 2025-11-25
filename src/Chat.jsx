import { useState, useEffect, useRef } from "react";
import "./App.css";

const initialUsers = {
  a: { id: "a", name: "Alice", color: "#4C7CF3", avatar: "A" },
  b: { id: "b", name: "Bob", color: "#F39C12", avatar: "B" },
};

export default function App() {
  const [users] = useState(initialUsers);
  const [activeUserId, setActiveUserId] = useState("a");
  const [messages, setMessages] = useState([
    { id: 1, userId: "a", text: "Hey Bob!", timestamp: Date.now() - 60000 },
    { id: 2, userId: "b", text: "Hey Alice, what's up?", timestamp: Date.now() - 45000 },
  ]);
  const [isTyping, setIsTyping] = useState({ a: false, b: false });
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, userId: activeUserId, text: trimmed, timestamp: Date.now() },
    ]);
    setIsTyping((prev) => ({ ...prev, [activeUserId]: false }));
  };

  const handleTyping = (typing) => {
    setIsTyping((prev) => ({ ...prev, [activeUserId]: typing }));
  };

  return (
    <div className="chat-shell">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-title">Chat Room</div>
        <div className="chat-presence">
          {Object.values(users).map((u) => (
            <div key={u.id} className="presence-item">
              <span className="avatar" style={{ backgroundColor: u.color }}>{u.avatar}</span>
              <span className={`name ${u.id === activeUserId ? "active" : ""}`}>{u.name}</span>
            </div>
          ))}
        </div>
        {Object.entries(isTyping).filter(([, t]) => t).length > 0 && (
          <div className="typing">
            {Object.entries(isTyping)
              .filter(([, t]) => t)
              .map(([id]) => users[id].name)
              .join(", ")} typing…
          </div>
        )}
      </header>

      {/* Messages */}
      <main className="message-list">
        {messages.map((m) => {
          const isOwn = m.userId === activeUserId;
          const user = users[m.userId];
          return (
            <div key={m.id} className={`message-row ${isOwn ? "own" : "other"}`}>
              {!isOwn && (
                <div className="bubble-meta">
                  <span className="avatar small" style={{ backgroundColor: user.color }}>
                    {user.avatar}
                  </span>
                </div>
              )}
              <div className="bubble" style={{ borderColor: user.color }}>
                <p>{m.text}</p>
                <span className="timestamp">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      {/* Footer */}
      <div className="chat-footer">
        <div className="user-toggle">
          {Object.values(users).map((u) => (
            <button
              key={u.id}
              className={`toggle-btn ${activeUserId === u.id ? "active" : ""}`}
              onClick={() => setActiveUserId(u.id)}
              style={{ borderColor: u.color }}
            >
              <span className="avatar tiny" style={{ backgroundColor: u.color }}>{u.avatar}</span>
              {u.name}
            </button>
          ))}
        </div>
        <MessageInput onSend={handleSend} onTyping={handleTyping} color={users[activeUserId].color} />
      </div>
    </div>
  );
}

function MessageInput({ onSend, onTyping, color }) {
  const [text, setText] = useState("");

  useEffect(() => {
    onTyping(Boolean(text));
    return () => onTyping(false);
  }, [text]);

  const submit = () => {
    onSend(text);
    setText("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="input-bar">
      <textarea
        className="input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a message…"
      />
      <button className="send" style={{ backgroundColor: color }} onClick={submit}>
        Send
      </button>
    </div>
  );
}
