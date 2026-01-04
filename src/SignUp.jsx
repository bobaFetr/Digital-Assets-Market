import React, { useState } from "react";
import "./App.css"; // Reuse App.css for consistent styling
import { Link } from "react-router-dom";

export default function SignUp() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Sign Up submitted", form);
        // Add registration logic here
    };

    return (
        <div className="crypto-layout" style={{ justifyContent: "center", alignItems: "center" }}>
            <div className="chart-container" style={{ width: "100%", maxWidth: "400px", background: "var(--card-bg)" }}>
                <h2 className="header-greeting" style={{ textAlign: "center", marginBottom: "30px", fontSize: "24px" }}>
                    Create Account
                </h2>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            style={{
                                background: "rgba(0, 0, 0, 0.2)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: "8px",
                                padding: "12px",
                                color: "var(--text-primary)",
                                outline: "none",
                                fontSize: "16px"
                            }}
                            required
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            style={{
                                background: "rgba(0, 0, 0, 0.2)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: "8px",
                                padding: "12px",
                                color: "var(--text-primary)",
                                outline: "none",
                                fontSize: "16px"
                            }}
                            required
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            style={{
                                background: "rgba(0, 0, 0, 0.2)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: "8px",
                                padding: "12px",
                                color: "var(--text-primary)",
                                outline: "none",
                                fontSize: "16px"
                            }}
                            required
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            style={{
                                background: "rgba(0, 0, 0, 0.2)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: "8px",
                                padding: "12px",
                                color: "var(--text-primary)",
                                outline: "none",
                                fontSize: "16px"
                            }}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: "10px" }}>
                        Sign Up
                    </button>
                </form>

                <div style={{ marginTop: "20px", textAlign: "center", color: "var(--text-secondary)", fontSize: "14px" }}>
                    Already have an account?{" "}
                    <Link to="/" style={{ color: "var(--accent-blue)", textDecoration: "none" }}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
