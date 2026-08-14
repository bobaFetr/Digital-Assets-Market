import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import { Field, Notice, Page, Section } from "./Components/UI";
import { forgotPassword } from "./Services/Service";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("Enter the email address used for your account.");
      return;
    }
    setSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setMessage("If an account uses that email address, a reset message has been sent.");
    } catch (requestError) {
      setError(requestError?.message || "The reset request could not be sent. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crypto-layout">
      <Sidebar />
      <Page eyebrow="Account recovery" title="Reset password" description="Request a password-reset message for your account." className="ui-page--narrow">
        <Section>
          <Notice tone="error">{error}</Notice>
          <Notice tone="success">{message}</Notice>
          <form className="ui-form" onSubmit={submit}>
            <Field label="Email address">
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </Field>
            <button className="btn-primary" type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send reset message"}</button>
          </form>
          <p><Link to="/sign-in">Back to sign in</Link></p>
        </Section>
      </Page>
    </div>
  );
}
