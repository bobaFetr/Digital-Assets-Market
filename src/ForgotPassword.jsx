import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import { forgotPassword } from "./Services/auth";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await forgotPassword(email.trim());
      setSuccess(String(response || "If an account with that email exists, a reset link has been sent."));
    } catch (err) {
      setError(err.message || "Failed to request password reset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        <div className="login-shell">
          <section className="login-hero">
            <div className="hero-content">
              <h1>Forgot Password</h1>
              <p>Enter your account email and we will send you a password reset link.</p>
            </div>
          </section>

          <section className="login-panel">
            <div className="login-card">
              <h2>Reset access</h2>
              <p className="subtext">We will email you a secure reset link</p>

              {error && <div className="login-alert">{error}</div>}
              {success && (
                <div
                  style={{
                    background: "rgba(74, 222, 128, 0.15)",
                    color: "#bbf7d0",
                    border: "1px solid rgba(74, 222, 128, 0.4)",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    marginBottom: "16px",
                    fontSize: "14px",
                  }}
                >
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <label>
                  Email
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>

                <button type="submit" className="login-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <p className="signup-text">
                Remembered your password? <Link to="/sign-in">Back to sign in</Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
