import React from "react";
import Sidebar from "./Components/Sidebar";

export default function News() {
    // Mock data for news articles
    const newsArticles = [
        { id: 1, title: "Bitcoin Hits New High", category: "Market", time: "2h ago", summary: "The leading cryptocurrency has surpassed key resistance levels..." },
        { id: 2, title: "Ethereum 2.0 Update", category: "Tech", time: "5h ago", summary: "Developers announce new scaling solutions for the network..." },
        { id: 3, title: "Global Regulation News", category: "Policy", time: "1d ago", summary: "New frameworks are being established for digital assets worldwide..." },
        { id: 4, title: "AI in DeFi", category: "Innovation", time: "3d ago", summary: "How artificial intelligence is reshaping automated market makers..." }
    ];

    return (
        <div className="crypto-layout">
            {/* Sidebar - Retained from your original logic */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="crypto-main">
                {/* News Header using your specific CSS colors */}
                <header style={{ position: 'relative', width: '100%', marginBottom: '40px' }}>
                    <h1 style={{ color: '#EBA667', textAlign: 'left', fontSize: '2.5rem' }}>Crypto News</h1>
                    <div className="search-container">
                        <span className="search-icon">🔍</span>
                        <input type="text" placeholder="Search latest updates..." className="top-search-input" />
                    </div>
                </header>

                <section>
                    <h2 className="header-greeting">Trending Stories</h2>

                    {/* Using your cards-grid class for the news layout */}
                    <div className="cards-grid">
                        {newsArticles.map((article) => (
                            <div key={article.id} className="coin-card" style={{ minHeight: '200px', cursor: 'pointer' }}>
                                <div className="coin-header">
                                    <span className="reward-label" style={{ color: '#7f8cff' }}>{article.category}</span>
                                    <h4>{article.title}</h4>
                                </div>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '15px 0' }}>
                                    {article.summary}
                                </p>
                                <div className="coin-rate" style={{ fontSize: '12px', color: '#4dff88' }}>
                                    {article.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Example of a List-style News section using your <li> styles */}
                <section style={{ marginTop: '40px' }}>
                    <h3>Recent Updates</h3>
                    <ul style={{ padding: 0 }}>
                        <li style={{ borderRadius: '8px', marginBottom: '10px' }}>
                            <strong>Market Alert:</strong> Volatility expected in the next 24 hours due to CPI data.
                        </li>
                        <li style={{ borderRadius: '8px', marginBottom: '10px' }}>
                            <strong>New Listing:</strong> "Solana Ecosystem" tokens added to favorites.
                        </li>
                    </ul>
                </section>
            </main>

            {/* Right Sidebar - Re-purposed for Market Quick-View */}
            <aside className="crypto-right-sidebar">
                <div className="balance-card">
                    <p className="balance-title">Market Sentiment</p>
                    <p className="balance-amount" style={{ color: '#4dff88' }}>Bullish</p>
                </div>

                <div className="exchange-section">
                    <h4 style={{ marginBottom: '15px' }}>Quick Market</h4>
                    <div className="market-list">
                        <div className="market-item">
                            <span className="market-code">BTC</span>
                            <span className="rate-up">+2.4%</span>
                        </div>
                        <div className="market-item">
                            <span className="market-code">ETH</span>
                            <span className="rate-down">-1.2%</span>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}