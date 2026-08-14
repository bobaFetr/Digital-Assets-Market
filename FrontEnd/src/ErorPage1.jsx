import React from "react";
import { useNavigate } from "react-router-dom";

export default function ErorPage1() {
  const navigate = useNavigate();
  return (
    <main className="error-page">
      <section className="error-card">
        <p className="error-code">404</p>
        <h1 className="error-title">Page not found</h1>
        <p className="error-copy">The address may be incorrect, or the page may have moved.</p>
        <div className="error-actions">
          <button className="btn-primary" type="button" onClick={() => navigate("/")}>Go home</button>
          <button className="btn-ghost" type="button" onClick={() => navigate("/news")}>View news</button>
        </div>
      </section>
    </main>
  );
}
