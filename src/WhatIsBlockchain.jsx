import React from "react";
import Sidebar from "./Components/Sidebar";

export default function WhatIsBlockchain() {
  return (
    <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        <h1 style={{ marginBottom: "16px" }}>What is Blockchain?</h1>
        <p style={{ color: "#aaa", marginBottom: "24px" }}>
          A simple overview of how blockchain networks store and secure data.
        </p>

        <div style={{ background: "#1a1d2e", padding: "24px", borderRadius: "12px", border: "1px solid #22283a" }}>
          <h3 style={{ marginTop: 0 }}>Distributed ledger</h3>
          <p style={{ color: "#c7cbe0" }}>
            Blockchain is a shared database where many computers keep the same transaction history.
          </p>

          <h3>Blocks and chain</h3>
          <p style={{ color: "#c7cbe0" }}>
            Transactions are grouped into blocks, and each block references the previous one, forming a chain.
          </p>

          <h3>Immutability and transparency</h3>
          <p style={{ color: "#c7cbe0" }}>
            Once recorded and confirmed, data is very hard to alter, and public chains can be independently verified.
          </p>

          <h3>Why it matters</h3>
          <p style={{ color: "#c7cbe0", marginBottom: 0 }}>
            It enables peer-to-peer value transfer without relying on a single central authority.
          </p>
        </div>
      </div>
    </div>
  );
}
