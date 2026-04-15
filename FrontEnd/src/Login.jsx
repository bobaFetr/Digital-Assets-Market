import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Login.css";
import { getProfile, loginUser } from "./Services/Service";
import Sidebar from "./Components/Sidebar";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const nextError = location.state?.error;
    if (typeof nextError === "string" && nextError.trim()) {
      setError(nextError);
    }
  }, [location.state]);

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
              <p>Sign in to view your profile, fund your wallet, and use the digital asset trading demo.</p>
              <ul>
                <li>Profile and wallet overview</li>
                <li>Simulated card funding</li>
                <li>Demo buy and sell of digital assets</li>
              </ul>
            </div>
          </section>

          <section className="login-panel">
            <div className="login-card">
              <h2>Sign in</h2>
              <p className="subtext">Use your registered account email and password.</p>

              {error && <div className="login-alert">{error}</div>}

              <form onSubmit={handleSubmit} className="login-form">
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  Password
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
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
                <span>demo project</span>
              </div>

              <div className="social-buttons">
                <button type="button" disabled>Local account only</button>
              </div>

              <p className="signup-text">
                New to the platform? <Link to="/sign-up">Create an account</Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
