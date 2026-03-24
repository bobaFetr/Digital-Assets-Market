import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import { getToken, request } from "./Services/Service";
import "./News.css";

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

    const featuredArticle = filteredArticles[0] || null;
    const trendingArticles = filteredArticles.slice(featuredArticle ? 1 : 0);
    const recentUpdates = filteredArticles.slice(0, 5);
    const totalArticles = articles.length;
    const visibleArticles = filteredArticles.length;
    const latestTimestamp = filteredArticles[0]?.publishedAt;

    return (
        <div className="crypto-layout">
            <Sidebar />

            <main className="crypto-main news-page-main">
                <header className="news-hero">
                    <div className="news-hero-content">
                        <p className="news-hero-kicker">Live Desk</p>
                        <h1 className="news-hero-title">Crypto Newsroom</h1>
                        <p className="news-hero-subtitle">
                            Track market-moving headlines, protocol upgrades, and
                            regulatory shifts in one clean feed.
                        </p>
                    </div>
                    <div className="news-search-container">
                        <span className="news-search-icon" aria-hidden="true" />
                        <input
                            type="text"
                            placeholder="Search latest updates..."
                            className="news-search-input"
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

                    <div className="news-metrics" role="status" aria-label="News dashboard metrics">
                        <div className="news-metric-tile">
                            <span className="news-metric-label">Headlines</span>
                            <span className="news-metric-value">{totalArticles}</span>
                        </div>
                        <div className="news-metric-tile">
                            <span className="news-metric-label">Showing</span>
                            <span className="news-metric-value">{visibleArticles}</span>
                        </div>
                        <div className="news-metric-tile">
                            <span className="news-metric-label">Last Print</span>
                            <span className="news-metric-value">
                                {latestTimestamp ? formatRelativeTime(latestTimestamp) : "N/A"}
                            </span>
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="login-alert news-alert news-alert-error">
                        {error}
                    </div>
                )}

                {isLoading && (
                    <div className="news-alert news-alert-info">
                        Loading news...
                    </div>
                )}

                {!isLoading && !error && filteredArticles.length === 0 && (
                    <div className="news-alert news-alert-info">
                        No news found.
                    </div>
                )}

                {!isLoading && !error && featuredArticle && (
                    <section className="news-featured-section">
                        <p className="news-section-tag">Featured</p>
                        {featuredArticle.newsId ? (
                            <Link
                                to={`/news/${featuredArticle.newsId}`}
                                className="news-featured-card"
                            >
                                <h2 className="news-featured-title">{featuredArticle.title}</h2>
                                <p className="news-featured-text">
                                    {truncateText(featuredArticle.content, 260)}
                                </p>
                                <div className="news-featured-footer">
                                    <span className="news-chip">Top Story</span>
                                    <span>{formatRelativeTime(featuredArticle.publishedAt)}</span>
                                </div>
                            </Link>
                        ) : (
                            <article className="news-featured-card">
                                <h2 className="news-featured-title">{featuredArticle.title}</h2>
                                <p className="news-featured-text">
                                    {truncateText(featuredArticle.content, 260)}
                                </p>
                                <div className="news-featured-footer">
                                    <span className="news-chip">Top Story</span>
                                    <span>{formatRelativeTime(featuredArticle.publishedAt)}</span>
                                </div>
                            </article>
                        )}
                    </section>
                )}

                {!isLoading && !error && trendingArticles.length > 0 && (
                    <section className="news-trending-section">
                        <div className="news-section-headline-row">
                            <h2 className="news-section-title">Trending Stories</h2>
                        </div>
                        <div className="news-grid">
                            {trendingArticles.map((article) => {
                                const card = (
                                    <article className="news-card">
                                        <div className="news-card-head">
                                            <span className="news-chip">Update</span>
                                            <span className="news-time">
                                                {formatRelativeTime(article.publishedAt)}
                                            </span>
                                        </div>
                                        <h3 className="news-card-title">{article.title}</h3>
                                        <p className="news-card-text">
                                            {truncateText(article.content, 145)}
                                        </p>
                                    </article>
                                );

                                if (!article.newsId) {
                                    return (
                                        <div key={article.title || article.publishedAt}>
                                            {card}
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={article.newsId}
                                        to={`/news/${article.newsId}`}
                                        className="news-card-link"
                                    >
                                        {card}
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {!isLoading && !error && recentUpdates.length > 0 && (
                    <section className="news-recent-panel">
                        <h3 className="news-section-title">Recent Updates</h3>
                        <ul className="news-recent-list">
                            {recentUpdates.map((article) => (
                                <li key={article.newsId || article.title} className="news-recent-item">
                                    {article.newsId ? (
                                        <Link to={`/news/${article.newsId}`} className="news-recent-link">
                                            <span className="news-recent-item-title">{article.title}</span>
                                            <span className="news-recent-item-text">
                                                {truncateText(article.content, 120)}
                                            </span>
                                        </Link>
                                    ) : (
                                        <div className="news-recent-link">
                                            <span className="news-recent-item-title">{article.title}</span>
                                            <span className="news-recent-item-text">
                                                {truncateText(article.content, 120)}
                                            </span>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </main>

            <aside className="crypto-right-sidebar news-right-rail">
                <div className="news-rail-card">
                    <p className="news-rail-label">Market Sentiment</p>
                    <p className="news-rail-value">Bullish</p>
                </div>

                <div className="news-rail-card">
                    <h4 className="news-rail-heading">Quick Market</h4>
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

                <div className="news-rail-card news-rail-note">
                    <p className="news-rail-label">Digest</p>
                    <p className="news-rail-text">
                        Watch for macro headlines this week. Volatility often spikes
                        around policy announcements.
                    </p>
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
