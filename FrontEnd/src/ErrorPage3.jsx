import React from "react";
import { useNavigate } from "react-router-dom";

export default function ErrorPage3() {
  const navigate = useNavigate();
  return (
    <main className="error-page">
      <section className="error-card">
        <p className="error-code">401</p>
        <h1 className="error-title">Sign-in required</h1>
        <p className="error-copy">Your session has ended. Sign in again to continue.</p>
        <div className="error-actions">
          <button className="btn-primary" type="button" onClick={() => navigate("/sign-in")}>Sign in</button>
          <button className="btn-ghost" type="button" onClick={() => navigate("/")}>Go home</button>
        </div>
      </section>
    </main>
  );
}
