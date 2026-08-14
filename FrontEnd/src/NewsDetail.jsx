import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import { getToken, request } from "./Services/Service";
import "./News.css";

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
                const data = await request(`/api/news/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });

                if (typeof data === "string") {
                    throw new Error(data || "Unexpected non-JSON response from server");
                }
                if (!isActive) return;
                setArticle(data);
            } catch (fetchError) {
                if (!isActive) return;
                setError(fetchError?.message || "Failed to load news item.");
                setArticle(null);
            } finally {
                if (isActive) setIsLoading(false);
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
            <main className="crypto-main news-page-main">
                <header className="page-header">
                    <Link to="/news">Back to news</Link>
                </header>

                {error && <div className="login-alert news-alert news-alert-error">{error}</div>}
                {isLoading && <div className="news-alert news-alert-info">Loading news...</div>}

                {!isLoading && !error && article && (
                    <article className="news-detail-card">
                        <div className="news-list-date">{formatDate(article.publishedAt)}</div>
                        <h1 className="news-detail-title">{article.title}</h1>
                        <p className="news-detail-content">{article.content}</p>
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
