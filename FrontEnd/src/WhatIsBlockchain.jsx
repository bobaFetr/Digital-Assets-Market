import React from "react";
import Sidebar from "./Components/Sidebar";

export default function WhatIsBlockchain() {
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
        <h1 style={{ marginBottom: "16px" }}>What is Blockchain?</h1>
        <p style={{ color: mutedText, marginBottom: "24px" }}>
          A simple overview of how blockchain networks store and secure data.
        </p>

        <div style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>Distributed ledger</h3>
          <p style={{ color: mutedText }}>
            Blockchain is a shared database where many computers keep the same transaction history.
          </p>

          <h3>Blocks and chain</h3>
          <p style={{ color: mutedText }}>
            Transactions are grouped into blocks, and each block references the previous one, forming a chain.
          </p>

          <h3>Immutability and transparency</h3>
          <p style={{ color: mutedText }}>
            Once recorded and confirmed, data is very hard to alter, and public chains can be independently verified.
          </p>

          <h3>Why it matters</h3>
          <p style={{ color: mutedText, marginBottom: 0 }}>
            It enables peer-to-peer value transfer without relying on a single central authority.
          </p>
        </div>
      </div>
    </div>
  );
}
