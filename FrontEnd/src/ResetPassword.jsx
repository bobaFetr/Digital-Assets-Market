import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import { Field, Notice, Page, Section } from "./Components/UI";
import { resetPassword } from "./Services/Service";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useMemo(() => new URLSearchParams(location.search).get("token") || "", [location.search]);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!token) return setError("Open the complete reset link from your email.");
    if (password.length < 8) return setError("Enter a password with at least 8 characters.");
    if (password !== confirmation) return setError("The passwords do not match.");
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setMessage("Your password has been changed.");
      setTimeout(() => navigate("/sign-in"), 1200);
    } catch (requestError) {
      setError(requestError?.message || "The password could not be changed. Request a new reset link.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crypto-layout">
      <Sidebar />
      <Page eyebrow="Account recovery" title="Choose a new password" description="Use at least 8 characters." className="ui-page--narrow">
        <Section>
          <Notice tone="error">{error}</Notice>
          <Notice tone="success">{message}</Notice>
          <form className="ui-form" onSubmit={submit}>
            <Field label="New password"><input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></Field>
            <Field label="Confirm new password"><input type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></Field>
            <button className="btn-primary" type="submit" disabled={submitting}>{submitting ? "Changing password…" : "Change password"}</button>
          </form>
          <p><Link to="/sign-in">Back to sign in</Link></p>
        </Section>
      </Page>
    </div>
  );
}
