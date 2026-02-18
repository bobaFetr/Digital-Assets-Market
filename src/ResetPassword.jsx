import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import { resetPassword } from "./Services/auth";
import "./Login.css";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token") || "";
  }, [location.search]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resetPassword(token, newPassword);
      setSuccess(String(response || "Password reset successful."));
      setTimeout(() => navigate("/sign-in"), 1200);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
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
              <h1>Set New Password</h1>
              <p>Choose a strong password for your account security.</p>
            </div>
          </section>

          <section className="login-panel">
            <div className="login-card">
              <h2>Reset password</h2>
              <p className="subtext">Use at least 8 characters</p>

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
                  New password
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </label>

                <label>
                  Confirm password
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </label>

                <button type="submit" className="login-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Resetting..." : "Reset password"}
                </button>
              </form>

              <p className="signup-text">
                <Link to="/sign-in">Back to sign in</Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
