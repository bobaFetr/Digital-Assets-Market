import React from "react";
import Sidebar from "./Components/Sidebar";

export default function HowToSecureWallet() {
  const mutedText = "var(--text-secondary)";
  const panelStyle = {
    background: "var(--card-bg)",
    color: "var(--text-primary)",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid var(--glass-border)",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  };

  return (
    <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        <h1 style={{ marginBottom: "16px" }}>How to Secure Your Wallet</h1>
        <p style={{ color: mutedText, marginBottom: "24px" }}>
          Practical steps to keep your crypto wallet and funds safe.
        </p>

        <div style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>1. Protect your seed phrase</h3>
          <p style={{ color: mutedText }}>
            Write your recovery phrase offline and store it in a secure place. Never share it with anyone.
          </p>

          <h3>2. Enable strong authentication</h3>
          <p style={{ color: mutedText }}>
            Use a strong unique password and enable 2FA on your exchange and related email accounts.
          </p>

          <h3>3. Verify addresses before sending</h3>
          <p style={{ color: mutedText }}>
            Double-check wallet addresses and network types. Send a small test transfer first.
          </p>

          <h3>4. Watch for phishing and scams</h3>
          <p style={{ color: mutedText, marginBottom: 0 }}>
            Avoid unknown links, fake support contacts, and urgent account-issue messages.
          </p>
        </div>
      </div>
    </div>
  );
}
