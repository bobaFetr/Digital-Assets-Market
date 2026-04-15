import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { createDefaultWallets, loginUser, registerUser } from "./Services/Service";
import Sidebar from "./Components/Sidebar";

const COOKIE_CONSENT_TRIGGER_KEY = "crypto_cookie_consent_trigger_v1";

export default function SignUp() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    idNumber: "",
    dob: "",
    expiryDate: "",
    country: "",
    documentType: "Passport",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrencyChoice, setShowCurrencyChoice] = useState(false);
  const [bankChoices, setBankChoices] = useState({ USD: false, EUR: false });
  const [cryptoChoices, setCryptoChoices] = useState({ USDT: false, BTC: false, ETH: false, BNB: false, ALGO: false });
  const [fileName, setFileName] = useState("");
  const [uploadInfo, setUploadInfo] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName("");
      setUploadInfo("");
      return;
    }

    setFileName(file.name);
    setUploadInfo(`Selected file: ${file.name}`);

    if (!file.name.toLowerCase().endsWith(".txt")) {
      setUploadInfo(`Selected file: ${file.name}. Auto-fill works only with .txt demo ID files.`);
      return;
    }

    parseIdentityFile(file)
      .then((parsed) => {
        if (!parsed) {
          setUploadInfo("Could not parse the uploaded ID file. Please fill in the fields manually.");
          return;
        }

        setForm((prev) => ({
          ...prev,
          ...Object.fromEntries(Object.entries(parsed).filter(([, value]) => Boolean(value))),
        }));

        if (!parsed.dob) {
          setUploadInfo("Document loaded, but the date of birth was not recognized.");
          return;
        }

        const age = getAge(parsed.dob);
        if (!Number.isNaN(age) && age >= 18) {
          setUploadInfo(`Document loaded successfully. Age check passed (${age}).`);
          return;
        }

        setUploadInfo("Document loaded, but the age check failed. The user must be 18+.");
      })
      .catch(() => {
        setUploadInfo("Could not read the uploaded file. Please try again.");
      });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all account fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.fullName || !form.idNumber || !form.dob || !form.expiryDate || !form.country) {
      setError("Please complete all identity verification fields.");
      return;
    }

    const age = getAge(form.dob);
    if (Number.isNaN(age) || age < 18) {
      setError("You must be at least 18 years old to complete identity verification.");
      return;
    }

    setError("");
    setShowCurrencyChoice(true);
  };

  const handleBankToggle = (code) => {
    setBankChoices((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const handleCryptoToggle = (code) => {
    setCryptoChoices((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const submitWithChoices = async () => {
    setIsSubmitting(true);
    setError("");

    const bankSelected = Object.keys(bankChoices).filter((key) => bankChoices[key]);
    const cryptoSelected = Object.keys(cryptoChoices).filter((key) => cryptoChoices[key]);

    try {
      await registerUser({
        UserName: form.username.trim(),
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        idNumber: form.idNumber,
        dateOfBirth: form.dob,
        expiryDate: form.expiryDate,
        country: form.country,
        documentType: form.documentType,
        idFilePath: fileName,
        BankAccountCurrencies: bankSelected.length ? bankSelected : null,
        InitialCryptoCurrencies: cryptoSelected.length ? cryptoSelected : null,
      });

      window.localStorage.setItem(COOKIE_CONSENT_TRIGGER_KEY, "true");
      await loginUser({ email: form.email, password: form.password }, true);

      try {
        if (bankSelected.length || cryptoSelected.length) {
          await createDefaultWallets({
            BankAccountCurrencies: bankSelected.length ? bankSelected : null,
            InitialCryptoCurrencies: cryptoSelected.length ? cryptoSelected : null,
          });
        }
      } catch {
        // Non-fatal: registration succeeded and wallet creation is idempotent.
      }

      navigate("/profile");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
      setShowCurrencyChoice(false);
    }
  };

  return (
    <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        <div className="login-shell">
          <section className="login-hero">
            <div className="hero-content">
              <h1>Create account</h1>
              <p>Create a demo account, upload identity details, and start using the platform simulation.</p>
              <ul>
                <li>Profile and wallet setup</li>
                <li>Identity document upload simulation</li>
                <li>Demo funding and digital asset trading</li>
              </ul>
            </div>
          </section>

          <section className="login-panel">
            <div className="login-card">
              <h2>Create account</h2>
              <p className="subtext">Register a new Digital Asset Marketplace demo account.</p>

              {error && <div className="login-alert">{error}</div>}

              <form onSubmit={handleSubmit} className="login-form">
                <label>
                  Username
                  <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Your username" />
                </label>

                <label>
                  Email
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
                </label>

                <label>
                  Password
                  <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Create a password" />
                </label>

                <label>
                  Confirm Password
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat the password" />
                </label>

                <div className="login-divider">
                  <span>identity verification demo</span>
                </div>

                <label>
                  Full name
                  <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Jane Doe" />
                </label>

                <label>
                  ID number
                  <input type="text" name="idNumber" value={form.idNumber} onChange={handleChange} placeholder="Passport / National ID" />
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
                  Upload ID document
                  <input type="file" accept="image/*,.pdf,.txt" onChange={handleFileChange} />
                </label>

                <label>
                  Uploaded document
                  <input type="text" value={fileName || "No file selected"} readOnly />
                </label>

                {uploadInfo && <p className="subtext" style={{ marginTop: 0 }}>{uploadInfo}</p>}
                <p className="subtext" style={{ marginTop: 0 }}>
                  Uploading a document here simulates scanning or photographing an ID during registration.
                </p>

                <label>
                  Country of residence
                  <input type="text" name="country" value={form.country} onChange={handleChange} placeholder="Country" />
                </label>

                <button type="submit" className="login-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create account"}
                </button>
              </form>

              {showCurrencyChoice && (
                <div
                  className="currency-modal"
                  style={{
                    position: "fixed",
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ background: "#fff", color: "#111827", padding: 20, borderRadius: 12, width: 520, maxWidth: "95%" }}>
                    <h3>Choose starting wallets</h3>
                    <p className="subtext">Select the fiat wallets and crypto wallets you want created immediately after registration.</p>

                    <div style={{ marginTop: 12 }}>
                      <strong>Fiat wallets</strong>
                      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input type="checkbox" checked={bankChoices.USD} onChange={() => handleBankToggle("USD")} />
                          USD
                        </label>
                        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input type="checkbox" checked={bankChoices.EUR} onChange={() => handleBankToggle("EUR")} />
                          EUR
                        </label>
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <strong>Crypto wallets</strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
                        {Object.keys(cryptoChoices).map((code) => (
                          <label key={code} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input type="checkbox" checked={cryptoChoices[code]} onChange={() => handleCryptoToggle(code)} />
                            {code}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
                      <button onClick={() => setShowCurrencyChoice(false)} style={{ padding: "8px 12px" }} disabled={isSubmitting}>Back</button>
                      <button onClick={submitWithChoices} style={{ padding: "8px 12px" }} disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Confirm and create account"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="login-divider">
                <span>demo project</span>
              </div>

              <div className="social-buttons">
                <button type="button" disabled>Local account registration only</button>
              </div>

              <p className="signup-text">
                Already have an account? <Link to="/sign-in">Sign in</Link>
              </p>
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

const parseIdentityFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || "");
      const parsed = parseIdentityText(content);
      resolve(parsed);
    };
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsText(file);
  });

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

  const dobRaw = lookup["date of birth"] || lookup.dob;
  const expiryRaw = lookup["document expiry date"] || lookup["expiry date"];

  return {
    fullName: lookup["full name"] || lookup.name || "",
    dob: normalizeDate(dobRaw),
    idNumber: lookup["id number"] || lookup["document number"] || "",
    documentType: lookup["document type"] || "Passport",
    country: lookup["country of residence"] || lookup.country || "",
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
