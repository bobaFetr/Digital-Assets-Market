import React from "react";
import { useNavigate } from "react-router-dom";

export default function ErrorPage2() {
  const navigate = useNavigate();
  return (
    <main className="error-page">
      <section className="error-card">
        <p className="error-code">503</p>
        <h1 className="error-title">Service unavailable</h1>
        <p className="error-copy">The service cannot respond right now. Try again in a few minutes.</p>
        <div className="error-actions">
          <button className="btn-primary" type="button" onClick={() => window.location.reload()}>Try again</button>
          <button className="btn-ghost" type="button" onClick={() => navigate("/")}>Go home</button>
        </div>
      </section>
    </main>
  );
}
