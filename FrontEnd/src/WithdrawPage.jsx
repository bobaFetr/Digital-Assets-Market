import React, { useState } from "react";
import Sidebar from "./Components/Sidebar";

export default function WithDraw() {
    const [selectedCoin, setSelectedCoin] = useState("BTC");
    const fieldStyle = {
        width: "100%",
        padding: "16px",
        borderRadius: "12px",
        background: "var(--card-bg)",
        color: "var(--input-text)",
        border: "1px solid var(--glass-border)",
        fontSize: "16px",
        outline: "none",
    };
    const labelStyle = {
        marginBottom: "10px",
        color: "var(--text-secondary)",
        fontSize: "14px",
    };

    return (
        <div className="crypto-layout">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="crypto-main">
                <h2 className="header-greeting">Withdraw Assets</h2>

                <div className="chart-container">
                    <h3 className="chart-header">Select Cryptocurrency</h3>
                    <div style={{ marginBottom: "20px" }}>
                        <select
                            style={{ ...fieldStyle, cursor: "pointer" }}
                            value={selectedCoin}
                            onChange={(e) => setSelectedCoin(e.target.value)}
                        >
                            <option value="BTC">Bitcoin (BTC)</option>
                            <option value="ETH">Ethereum (ETH)</option>
                            <option value="BCH">Bitcoin Cash (BCH)</option>
                            <option value="ALGO">Algorand (ALGO)</option>
                            <option value="USDT">Tether (USDT)</option>
                        </select>
                    </div>

                    <p style={labelStyle}>Destination Address</p>
                    <input
                        type="text"
                        placeholder="Enter wallet address"
                        style={{ ...fieldStyle, marginBottom: "20px" }}
                    />

                    <p style={labelStyle}>Amount</p>
                    <input
                        type="number"
                        placeholder="0.00"
                        style={{ ...fieldStyle, marginBottom: "30px" }}
                    />

                    <button className="btn-primary" style={{ fontSize: "16px", padding: "16px" }}>
                        Verify Identity
                    </button>
                </div>
            </div>

            {/* Right Sidebar */}
            <aside className="crypto-right-sidebar">
                <div className="balance-card">
                    <div className="balance-title">Available Balance</div>
                    <h1 className="balance-amount">$37.4343</h1>
                </div>

                <div className="exchange-section" style={{ background: "transparent", padding: 0 }}>
                    <h3 className="chart-header">Recent Withdrawals</h3>
                    <div className="market-list">
                        <div className="market-item">
                            <span className="market-code">BTC</span>
                            <span className="rate-down">-0.0024</span>
                        </div>
                        <div className="market-item">
                            <span className="market-code">ETH</span>
                            <span className="rate-down">-0.1500</span>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
