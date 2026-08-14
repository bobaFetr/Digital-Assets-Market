import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import { Field, Notice, Page, Section } from "./Components/UI";
import { getProfile, loginUser } from "./Services/Service";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const change = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.email.trim()) return setError("Enter your email address.");
    if (!form.password) return setError("Enter your password.");
    setSubmitting(true);
    try {
      await loginUser({ email: form.email.trim(), password: form.password }, form.remember);
      const profile = await getProfile();
      const destination = location.state?.from || (profile?.role === "Admin" ? "/Admin" : "/profile");
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError?.message || "The email or password was not accepted.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crypto-layout">
      <Sidebar />
      <Page eyebrow="Account access" title="Sign in" description="Use the email address and password for your account." className="ui-page--narrow">
        <Section>
          <Notice tone="error">{location.state?.error || error}</Notice>
          <form className="ui-form" onSubmit={submit}>
            <Field label="Email address"><input name="email" type="email" autoComplete="email" value={form.email} onChange={change} /></Field>
            <Field label="Password"><input name="password" type="password" autoComplete="current-password" value={form.password} onChange={change} /></Field>
            <label className="ui-check"><input name="remember" type="checkbox" checked={form.remember} onChange={change} />Keep me signed in on this device</label>
            <button className="btn-primary" type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button>
          </form>
          <p><Link to="/forgot-password">Forgot password?</Link></p>
          <p>Need an account? <Link to="/sign-up">Create one</Link></p>
        </Section>
      </Page>
    </div>
  );
}
