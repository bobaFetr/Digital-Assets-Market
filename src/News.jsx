import React from 'react';
import './App.css'; // Reusing App.css for basic layout

function News() {
    const newsItems = [
        {
            id: 1,
            title: "Bitcoin Surges Past $100k",
            summary: "Bitcoin has reached an all-time high, breaking the psychological barrier of $100,000.",
            source: "CryptoDaily",
            date: "2025-10-24"
        },
        {
            id: 2,
            title: "Ethereum 3.0 Upgrades Announced",
            summary: "Vitalik Buterin outlines the roadmap for Ethereum 3.0, promising faster transactions.",
            source: "EthNews",
            date: "2025-10-23"
        },
        {
            id: 3,
            title: "New Regulations for DeFi",
            summary: "Global regulators are proposing new frameworks for Decentralized Finance protocols.",
            source: "RegulatoryWatch",
            date: "2025-10-22"
        }
    ];

    return (
        <div className="crypto-layout">
            <Sidebar />
            <div className="crypto-main">
                <h1 style={{ marginBottom: '20px' }}>Crypto News</h1>
                <div style={{ display: 'grid', gap: '20px' }}>
                    {newsItems.map(item => (
                        <div key={item.id} style={{
                            background: '#1a1d2e',
                            padding: '20px',
                            borderRadius: '12px',
                            border: '1px solid #22283a'
                        }}>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{item.title}</h2>
                            <p style={{ color: '#aaa', marginBottom: '10px' }}>{item.summary}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#7f8cff' }}>
                                <span>{item.source}</span>
                                <span>{item.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default News;
