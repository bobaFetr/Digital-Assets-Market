import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import { Field, Notice, Page, Section } from "./Components/UI";
import { createDefaultWallets, loginUser, registerUser } from "./Services/Service";
import "./Login.css";

const initialWallets = { USD: true, EUR: false, BTC: false, ETH: false, USDT: false };

export default function SignUp() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [wallets, setWallets] = useState(initialWallets);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.username.trim()) return setError("Enter a username.");
    if (!form.email.trim()) return setError("Enter an email address.");
    if (form.password.length < 8) return setError("Enter a password with at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("The passwords do not match.");

    const fiat = ["USD", "EUR"].filter((code) => wallets[code]);
    const crypto = ["BTC", "ETH", "USDT"].filter((code) => wallets[code]);
    setSubmitting(true);
    try {
      await registerUser({
        UserName: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        BankAccountCurrencies: fiat.length ? fiat : null,
        InitialCryptoCurrencies: crypto.length ? crypto : null,
      });
      await loginUser({ email: form.email.trim(), password: form.password }, true);
      if (fiat.length || crypto.length) {
        await createDefaultWallets({ BankAccountCurrencies: fiat, InitialCryptoCurrencies: crypto }).catch(() => null);
      }
      navigate("/profile");
    } catch (requestError) {
      setError(requestError?.message || "The account could not be created. Check the details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crypto-layout">
      <Sidebar />
      <Page eyebrow="Paper trading" title="Create account" description="Create a local account for the paper-trading environment." className="ui-page--narrow">
        <Section>
          <Notice tone="error">{error}</Notice>
          <form className="ui-form" onSubmit={submit}>
            <Field label="Username"><input name="username" autoComplete="username" value={form.username} onChange={change} /></Field>
            <Field label="Email address"><input name="email" type="email" autoComplete="email" value={form.email} onChange={change} /></Field>
            <Field label="Password" hint="Use at least 8 characters."><input name="password" type="password" autoComplete="new-password" value={form.password} onChange={change} /></Field>
            <Field label="Confirm password"><input name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={change} /></Field>

            <fieldset className="ui-fieldset">
              <legend>Starting wallets</legend>
              <p className="ui-field-hint">These are internal paper-trading balances. You can add more wallets later.</p>
              {Object.keys(initialWallets).map((code) => (
                <label className="ui-check" key={code}>
                  <input type="checkbox" checked={wallets[code]} onChange={() => setWallets((current) => ({ ...current, [code]: !current[code] }))} />
                  {code}
                </label>
              ))}
            </fieldset>

            <button className="btn-primary" type="submit" disabled={submitting}>{submitting ? "Creating account…" : "Create account"}</button>
          </form>
          <p>Already registered? <Link to="/sign-in">Sign in</Link></p>
        </Section>
      </Page>
    </div>
  );
}
