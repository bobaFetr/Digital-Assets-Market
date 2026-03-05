import React, { useState } from "react";
import Sidebar from "./Components/Sidebar";

export default function WithDraw() {
    const [selectedCoin, setSelectedCoin] = useState("BTC");

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
                            style={{
                                width: "100%",
                                padding: "16px",
                                borderRadius: "12px",
                                background: "#1a1d2e",
                                color: "white",
                                border: "1px solid rgba(127, 140, 255, 0.1)",
                                fontSize: "16px",
                                outline: "none",
                                cursor: "pointer"
                            }}
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

                    <p style={{ marginBottom: "10px", color: "#7f8cff", fontSize: "14px" }}>Destination Address</p>
                    <input
                        type="text"
                        placeholder="Enter wallet address"
                        style={{
                            width: "100%",
                            padding: "16px",
                            borderRadius: "12px",
                            background: "#0d0f1a",
                            color: "white",
                            border: "1px solid rgba(127, 140, 255, 0.1)",
                            marginBottom: "20px",
                            fontSize: "16px"
                        }}
                    />

                    <p style={{ marginBottom: "10px", color: "#7f8cff", fontSize: "14px" }}>Amount</p>
                    <input
                        type="number"
                        placeholder="0.00"
                        style={{
                            width: "100%",
                            padding: "16px",
                            borderRadius: "12px",
                            background: "#0d0f1a",
                            color: "white",
                            border: "1px solid rgba(127, 140, 255, 0.1)",
                            marginBottom: "30px",
                            fontSize: "16px"
                        }}
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
