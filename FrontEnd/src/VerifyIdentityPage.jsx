import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import Sidebar from "./Components/Sidebar";
import { getToken, submitKycVerification } from "./Services/Service";

export default function VerifyIdentityPage() {
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    idNumber: "",
    dob: "",
    expiryDate: "",
    country: "",
    documentType: "Passport",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName("");
      return;
    }

    setFileName(file.name);
    if (file.name.toLowerCase().endsWith(".txt")) {
      parseIdentityFile(file);
    }
  };

  const parseIdentityFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || "");
      const parsed = parseIdentityText(content);
      if (!parsed) {
        return;
      }

      setForm((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(parsed).filter(([, value]) => Boolean(value))
        ),
      }));
    };
    reader.readAsText(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!getToken()) {
      setError("Please sign in before submitting verification.");
      return;
    }
    if (!form.fullName || !form.idNumber || !form.dob || !form.expiryDate || !form.country) {
      setError("Please complete all required fields.");
      return;
    }

    const age = getAge(form.dob);
    if (Number.isNaN(age) || age < 18) {
      setError("You must be at least 18 years old to verify your identity.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await submitKycVerification({
        type: form.documentType,
        filePath: fileName,
        documentNumber: form.idNumber,
        fullName: form.fullName,
        dateOfBirth: form.dob,
        countryOfResidence: form.country,
        expiryDate: form.expiryDate,
        status: "Verified",
      });
      alert("Identity verification completed. You now have access to all features.");
    } catch (submitError) {
      setError(submitError.message || "Verification failed. Please try again.");
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
                  Document type
                  <select name="documentType" value={form.documentType} onChange={handleChange}>
                    <option value="Passport">Passport</option>
                    <option value="National ID">National ID</option>
                    <option value="Driver License">Driver License</option>
                  </select>
                </label>

                <label>
                  Date of birth
                  <input type="date" name="dob" value={form.dob} onChange={handleChange} />
                </label>

                <label>
                  Document expiry date
                  <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
                </label>

                <label>
                  Upload ID (optional)
                  <input
                    type="file"
                    accept="image/*,.pdf,.txt"
                    onChange={handleFileChange}
                  />
                </label>

                <label>
                  Country of residence
                  <input name="country" value={form.country} onChange={handleChange} placeholder="Country" />
                </label>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <Link to="/sign-in" className="link-button">Back to sign in</Link>
                  </div>
                  <button type="submit" className="login-submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Start verification"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const getAge = (dateOfBirth) => {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return NaN;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

const parseIdentityText = (text) => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return null;
  const lookup = {};
  lines.forEach((line) => {
    const parts = line.split(":");
    if (parts.length < 2) return;
    const key = parts[0].trim().toLowerCase();
    const value = parts.slice(1).join(":").trim();
    lookup[key] = value;
  });

  const dobRaw = lookup["date of birth"];
  const expiryRaw = lookup["document expiry date"];

  return {
    fullName: lookup["full name"] || "",
    dob: normalizeDate(dobRaw),
    idNumber: lookup["id number"] || "",
    documentType: lookup["document type"] || "Passport",
    country: lookup["country of residence"] || "",
    expiryDate: normalizeDate(expiryRaw),
  };
};

const normalizeDate = (value) => {
  if (!value) return "";
  const dotMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) {
    return `${dotMatch[3]}-${dotMatch[2]}-${dotMatch[1]}`;
  }
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return value;
  }
  return "";
};
