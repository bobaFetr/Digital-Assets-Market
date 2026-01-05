import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css"; // create this file with the styles below

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    // TODO: replace with real auth call
    alert(`Signed in as ${form.email}`);
  };

  return (
    <div className="login-shell">
      <section className="login-hero">
        <div className="hero-content">
          <h1>Welcome back</h1>
          <p>Track your digital assets, monitor live order books, and chat with your traders.</p>
          <ul>
            <li>Institution-grade security</li>
            <li>Real-time analytics dashboard</li>
            <li>24/7 concierge support</li>
          </ul>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <h2>Sign in or Sign in as Admin</h2>
          <p className="subtext">Use your Digital Assets Market credentials</p>

          {error && <div className="login-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <label>
              Email or Username or Phone Number
              <input
                type="email"
                name="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </label>

            <div className="login-options">
              <label className="remember">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />
                Remember me
              </label>
              <Link to="/verify-identity" className="link-button">Forgot password?</Link>
            </div>

            <button type="submit" className="login-submit">
              Sign in
            </button>
          </form>

          <div className="login-divider">
            <span>or continue with</span>
          </div>

          <div className="social-buttons">
            <button>Google</button>
            {/* <button>Microsoft</button>
            <button>Apple</button> */}
          </div>

          <p className="signup-text">
            New to DAM? <a href="/signup">Create an account</a>
          </p>
        </div>
      </section>
    </div>
  );
}