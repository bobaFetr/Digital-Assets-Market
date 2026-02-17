import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import { getToken } from "./Services/auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5149";

export default function NewsDetail() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isActive = true;
        const loadNewsItem = async () => {
            if (!id) {
                setError("News item not found.");
                return;
            }

            setIsLoading(true);
            setError("");
            try {
                const token = getToken();
                const res = await fetch(`${API_BASE}/api/news/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });

                if (!res.ok) {
                    throw new Error(await res.text());
                }

                const data = await res.json();
                if (!isActive) return;
                setArticle(data);
            } catch (fetchError) {
                if (!isActive) return;
                setError(fetchError?.message || "Failed to load news item.");
                setArticle(null);
            } finally {
                if (!isActive) return;
                setIsLoading(false);
            }
        };

        loadNewsItem();
        return () => {
            isActive = false;
        };
    }, [id]);

    return (
        <div className="crypto-layout">
            <Sidebar />
            <main className="crypto-main">
                <header style={{ position: "relative", width: "100%", marginBottom: "32px" }}>
                    <h1 style={{ color: "#EBA667", textAlign: "left", fontSize: "2.2rem" }}>
                        News Detail
                    </h1>
                    <div style={{ marginTop: "8px" }}>
                        <Link to="/news" style={{ color: "#7f8cff", textDecoration: "none" }}>
                            Back to news
                        </Link>
                    </div>
                </header>

                {error && <div className="login-alert">{error}</div>}
                {isLoading && (
                    <div style={{ color: "#9aa3ff", fontSize: "13px" }}>
                        Loading news...
                    </div>
                )}

                {!isLoading && !error && article && (
                    <article className="chart-container" style={{ padding: "20px" }}>
                        <div className="coin-header" style={{ marginBottom: "12px" }}>
                            <span className="reward-label" style={{ color: "#7f8cff" }}>Update</span>
                            <h2 style={{ marginTop: "6px" }}>{article.title}</h2>
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", marginBottom: "16px" }}>
                            {formatDate(article.publishedAt)}
                        </div>
                        <p style={{ fontSize: "15px", lineHeight: "1.7", color: "rgba(255,255,255,0.75)" }}>
                            {article.content}
                        </p>
                    </article>
                )}
            </main>
        </div>
    );
}

const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
};
