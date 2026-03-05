import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import Sidebar from "./Components/Sidebar";

export default function VerificationEmailPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^[0-9]{4,8}$/.test(code)) {
      setError("Enter the 4-8 digit code sent to your email.");
      return;
    }
    setError("");
    alert("Email verified — welcome back!");
  };

  return (
    <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        <div className="login-shell">
          <section className="login-hero">
            <div className="hero-content">
              <h1>Verify your email</h1>
              <p>Enter the verification code we sent to your email address.</p>
              <ul>
                <li>Check your spam folder if you don't see it</li>
                <li>Codes expire in 10 minutes</li>
              </ul>
            </div>
          </section>

          <section className="login-panel">
            <div className="login-card">
              <h2>Email verification</h2>
              <p className="subtext">We've sent verification email  to <strong>you@company.com</strong></p>

              {error && <div className="login-alert">{error}</div>}

              <form onSubmit={handleSubmit} className="login-form">
                <label>
                  Verification code
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Fill Code" />
                </label>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button type="button" className="link-button" onClick={() => alert("Resent verification email")}>Resend email</button>
                  <button type="submit" className="login-submit">Verify email</button>
                </div>

                <p style={{ marginTop: "12px" }}>
                  Didn’t get the email? <Link to="/verify-identity" className="link-button">Change email</Link>
                </p>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
