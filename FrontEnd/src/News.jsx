import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import { getToken, request } from "./Services/Service";

const API_BASE = import.meta.env?.VITE_API_BASE ?? "";

export default function News() {
    const [articles, setArticles] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(() => searchParams.get("q") || "");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isActive = true;
        const loadNews = async () => {
            setIsLoading(true);
            setError("");
            try {
                const token = getToken();
                const data = await request(`/api/news`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });

                if (typeof data === "string") {
                    throw new Error(data || "Unexpected non-JSON response from server");
                }
                if (!isActive) return;
                setArticles(Array.isArray(data) ? data : []);
            } catch (fetchError) {
                if (!isActive) return;
                setError(fetchError?.message || "Failed to load news.");
                setArticles([]);
            } finally {
                if (!isActive) return;
                setIsLoading(false);
            }
        };

        loadNews();
        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        const currentQuery = searchParams.get("q") || "";
        setQuery(currentQuery);
    }, [searchParams]);

    const filteredArticles = useMemo(() => {
        if (!query.trim()) return articles;
        const needle = query.toLowerCase();
        return articles.filter((article) =>
            String(article.title || "").toLowerCase().includes(needle) ||
            String(article.content || "").toLowerCase().includes(needle)
        );
    }, [articles, query]);

    const trendingArticles = filteredArticles;
    const recentUpdates = filteredArticles.slice(0, 2);

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
                        <input
                            type="text"
                            placeholder="Search latest updates..."
                            className="top-search-input"
                            value={query}
                            onChange={(event) => {
                                const nextValue = event.target.value;
                                setQuery(nextValue);
                                const nextParams = new URLSearchParams(searchParams);
                                if (nextValue.trim()) {
                                    nextParams.set("q", nextValue);
                                } else {
                                    nextParams.delete("q");
                                }
                                setSearchParams(nextParams, { replace: true });
                            }}
                        />
                    </div>
                </header>

                <section>
                    <h2 className="header-greeting">Trending Stories</h2>

                    {error && (
                        <div className="login-alert" style={{ marginBottom: '16px' }}>
                            {error}
                        </div>
                    )}

                    {isLoading && (
                        <div style={{ color: '#9aa3ff', fontSize: '13px', marginBottom: '16px' }}>
                            Loading news...
                        </div>
                    )}

                    {!isLoading && !error && trendingArticles.length === 0 && (
                        <div style={{ color: '#9aa3ff', fontSize: '13px', marginBottom: '16px' }}>
                            No news found.
                        </div>
                    )}

                    {/* Using your cards-grid class for the news layout */}
                    <div className="cards-grid">
                        {trendingArticles.map((article) => {
                            const card = (
                                <div className="coin-card" style={{ minHeight: '200px', cursor: 'pointer' }}>
                                    <div className="coin-header">
                                        <span className="reward-label" style={{ color: '#7f8cff' }}>Update</span>
                                        <h4>{article.title}</h4>
                                    </div>
                                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '15px 0' }}>
                                        {truncateText(article.content, 140)}
                                    </p>
                                    <div className="coin-rate" style={{ fontSize: '12px', color: '#4dff88' }}>
                                        {formatRelativeTime(article.publishedAt)}
                                    </div>
                                </div>
                            );

                            if (!article.newsId) {
                                return (
                                    <div key={article.title}>
                                        {card}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={article.newsId}
                                    to={`/news/${article.newsId}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    {card}
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Example of a List-style News section using your <li> styles */}
                <section style={{ marginTop: '40px' }}>
                    <h3>Recent Updates</h3>
                    <ul style={{ padding: 0 }}>
                        {recentUpdates.map((article) => (
                            <li key={article.newsId || article.title} style={{ borderRadius: '8px', marginBottom: '10px' }}>
                                {article.newsId ? (
                                    <Link to={`/news/${article.newsId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <strong>{article.title}:</strong> {truncateText(article.content, 120)}
                                    </Link>
                                ) : (
                                    <>
                                        <strong>{article.title}:</strong> {truncateText(article.content, 120)}
                                    </>
                                )}
                            </li>
                        ))}
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

const truncateText = (value, maxLength) => {
    const text = String(value || "");
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
};

const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};