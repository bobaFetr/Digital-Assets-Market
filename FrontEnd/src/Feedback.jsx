import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Components/Sidebar";

export default function Feedback() {
  return (
    <div className="crypto-layout">
      <Sidebar />
      <main className="crypto-main">
        <header className="page-header">
          <h1>Feedback</h1>
          <p>Feedback collection is not connected in this prototype.</p>
        </header>
        <section className="section-card">
          <p>No message is stored or submitted from this page.</p>
          <Link className="btn-primary" to="/">Return home</Link>
        </section>
      </main>
    </div>
  );
}
