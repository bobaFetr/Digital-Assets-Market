import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import { getToken, request } from "./Services/Service";
import "./News.css";

const excerpt = (value, limit = 180) => {
  const text = String(value || "");
  return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
};

const publishedDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
};

export default function News() {
  const [articles, setArticles] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const token = getToken();
        const data = await request("/api/news", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (active) setArticles(Array.isArray(data) ? data : []);
      } catch (loadError) {
        if (active) {
          setError(loadError?.message || "Failed to load news.");
          setArticles([]);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => setQuery(searchParams.get("q") || ""), [searchParams]);

  const filteredArticles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return articles;
    return articles.filter((article) =>
      String(article.title || "").toLowerCase().includes(needle) ||
      String(article.content || "").toLowerCase().includes(needle)
    );
  }, [articles, query]);

  const updateQuery = (value) => {
    setQuery(value);
    const next = new URLSearchParams(searchParams);
    value.trim() ? next.set("q", value) : next.delete("q");
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="crypto-layout">
      <Sidebar />
      <main className="crypto-main news-page-main">
        <header className="page-header">
          <h1>News</h1>
          <p>Project updates and digital-asset articles.</p>
          <input
            className="news-search-input"
            type="search"
            placeholder="Search articles"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
          />
        </header>

        {error && <div className="login-alert">{error}</div>}
        {isLoading && <p>Loading news…</p>}
        {!isLoading && !error && filteredArticles.length === 0 && <p>No articles found.</p>}

        <div className="news-list">
          {filteredArticles.map((article) => {
            const body = (
              <article className="news-list-item">
                <div className="news-list-date">{publishedDate(article.publishedAt)}</div>
                <h2>{article.title}</h2>
                <p>{excerpt(article.content)}</p>
              </article>
            );
            return article.newsId ? (
              <Link className="news-list-link" key={article.newsId} to={`/news/${article.newsId}`}>{body}</Link>
            ) : (
              <div key={article.title || article.publishedAt}>{body}</div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
