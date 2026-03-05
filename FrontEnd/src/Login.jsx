import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css"; // create this file with the styles below
import { getProfile, loginUser } from "./Services/Service";
import Sidebar from "./Components/Sidebar";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await loginUser({ email: form.email, password: form.password }, form.remember);
      const profile = await getProfile();
      if (profile?.role === "Admin") {
        navigate("/Admin");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      setError(err.message || "Sign in failed.");
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
              <p className="subtext">Use your Crypto Inc ЕООД credentials</p>

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
                  <Link to="/forgot-password" className="link-button">Forgot password?</Link>
                </div>

                <button type="submit" className="login-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign in"}
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
                New to Crypto Inc ЕООД? <a href="/signup">Create an account</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}