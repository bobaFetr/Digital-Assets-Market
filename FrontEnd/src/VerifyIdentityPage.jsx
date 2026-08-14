import React, { useState } from "react";
import Sidebar from "./Components/Sidebar";
import { Field, Notice, Page, Section } from "./Components/UI";
import { getToken, submitKycVerification } from "./Services/Service";

const emptyForm = { fullName: "", idNumber: "", dob: "", expiryDate: "", country: "", documentType: "Passport" };

export default function VerifyIdentityPage() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!getToken()) return setError("Sign in before submitting identity information.");
    if (Object.entries(form).some(([key, value]) => key !== "documentType" && !value)) return setError("Complete each identity field.");
    setSubmitting(true);
    try {
      await submitKycVerification({
        type: form.documentType,
        filePath: "",
        documentNumber: form.idNumber,
        fullName: form.fullName,
        dateOfBirth: form.dob,
        countryOfResidence: form.country,
        expiryDate: form.expiryDate,
        status: "Pending",
      });
      setMessage("The test identity record was submitted for administrative review.");
      setForm(emptyForm);
    } catch (requestError) {
      setError(requestError?.message || "The identity record could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crypto-layout">
      <Sidebar />
      <Page eyebrow="Optional verification" title="Identity review" description="Prototype workflow. Use test information only; do not enter real identity details." className="ui-page--narrow">
        <Section>
          <Notice tone="warning">This stores a test record in the project database. It does not contact an identity provider.</Notice>
          <Notice tone="error">{error}</Notice>
          <Notice tone="success">{message}</Notice>
          <form className="ui-form" onSubmit={submit}>
            <Field label="Full name"><input name="fullName" value={form.fullName} onChange={change} /></Field>
            <Field label="Document number"><input name="idNumber" value={form.idNumber} onChange={change} /></Field>
            <Field label="Document type"><select name="documentType" value={form.documentType} onChange={change}><option>Passport</option><option>National ID</option><option>Driver License</option></select></Field>
            <Field label="Date of birth"><input name="dob" type="date" value={form.dob} onChange={change} /></Field>
            <Field label="Document expiry date"><input name="expiryDate" type="date" value={form.expiryDate} onChange={change} /></Field>
            <Field label="Country of residence"><input name="country" value={form.country} onChange={change} /></Field>
            <button className="btn-primary" type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit test record"}</button>
          </form>
        </Section>
      </Page>
    </div>
  );
}
