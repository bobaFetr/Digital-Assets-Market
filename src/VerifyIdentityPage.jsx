import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

export default function VerifyIdentityPage() {
  const [form, setForm] = useState({ email: "", fullName: "", idNumber: "", dob: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.fullName || !form.idNumber) {
      setError("Please complete all required fields.");
      return;
    }
    setError("");
    // Simulate sending verification email or next step
    alert("Identity verification request submitted. Check your email for the verification link.");
  };

  return (
    <div className="login-shell">
      <section className="login-hero">
        <div className="hero-content">
          <h1>Verify your identity</h1>
          <p>Please provide a government-issued ID and basic details to verify your identity.</p>
          <ul>
            <li>Secure and encrypted</li>
            <li>Required for higher withdrawal limits</li>
            <li>Takes a few minutes</li>
          </ul>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <h2>Identity verification</h2>
          <p className="subtext">Complete the form below to start the verification process</p>

          {error && <div className="login-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <label>
              Email
              <input name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" />
            </label>

            <label>
              Full name
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Jane Doe" />
            </label>

            <label>
              ID number
              <input name="idNumber" value={form.idNumber} onChange={handleChange} placeholder="Passport / National ID" />
            </label>

            <label>
              Date of birth
              <input type="date" name="dob" value={form.dob} onChange={handleChange} />
            </label>

            <label>
              Upload ID (optional)
              <input type="file" accept="image/*,.pdf" />
            </label>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Link to="/sign-in" className="link-button">Back to sign in</Link>
              </div>
              <button type="submit" className="login-submit">Start verification</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
