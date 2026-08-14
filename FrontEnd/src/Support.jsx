import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Components/Sidebar";

export default function Support() {
  return (
    <div className="crypto-layout">
      <Sidebar />
      <main className="crypto-main">
        <header className="page-header">
          <h1>Support</h1>
          <p>This prototype does not operate a support inbox.</p>
        </header>
        <section className="section-card">
          <h2>Self-service information</h2>
          <p>For project usage and account questions, review the questions and education pages.</p>
          <div className="action-row">
            <Link className="btn-primary" to="/faq">Questions and answers</Link>
            <Link className="btn-ghost" to="/education">Education</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
