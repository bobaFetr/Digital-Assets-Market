import React, { useState } from "react";
import "./Login.css"; // reuse login styles so signup matches the login design
import { Link } from "react-router-dom";

export default function SignUp() {
    const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.username || !form.email || !form.password || !form.confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError("");
        // TODO: replace with real registration call
        alert(`Account created for ${form.email}`);
    };

    return (
        <div className="login-shell">
            <section className="login-hero">
                <div className="hero-content">
                    <h1>Create account</h1>
                    <p>Start managing your digital assets, chat with traders, and monitor real-time analytics.</p>
                    <ul>
                        <li>Institution-grade security</li>
                        <li>Real-time analytics dashboard</li>
                        <li>24/7 concierge support</li>
                    </ul>
                </div>
            </section>

            <section className="login-panel">
                <div className="login-card">
                    <h2>Create account</h2>
                    <p className="subtext">Create your Digital Assets Market account</p>

                    {error && <div className="login-alert">{error}</div>}

                    <form onSubmit={handleSubmit} className="login-form">
                        <label>
                            Username
                            <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Your username" />
                        </label>

                        <label>
                            Email
                            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" />
                        </label>

                        <label>
                            Password
                            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
                        </label>

                        <label>
                            Confirm Password
                            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" />
                        </label>

                        <button type="submit" className="login-submit">Create account</button>
                    </form>

                    <div className="login-divider">
                        <span>or continue with</span>
                    </div>

                    <div className="social-buttons">
                        <button>Google</button>
                        <button>Microsoft</button>
                        <button>Apple</button>
                    </div>

                    <p className="signup-text">
                        Already have an account? <Link to="/sign-in">Sign in</Link>
                    </p>
                </div>
            </section>
        </div>
    );
}

