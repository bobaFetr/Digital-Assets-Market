import React, { useState } from "react";
import "./Login.css"; // reuse login styles so signup matches the login design
import { Link, useNavigate } from "react-router-dom";
import { loginUser, registerUser, submitKycVerification } from "./Services/auth";
import Sidebar from "./Components/Sidebar";

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
    const [fileName, setFileName] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setFileName("");
            return;
        }

        setFileName(file.name);
        if (file.name.toLowerCase().endsWith(".txt")) {
            parseIdentityFile(file, setForm);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.email || !form.password || !form.confirmPassword) {
            setError("Please fill in all account fields.");
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!form.fullName || !form.idNumber || !form.dob || !form.expiryDate || !form.country) {
            setError("Please complete all identity fields.");
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
            await registerUser({
                UserName: form.username.trim(),
                email: form.email,
                password: form.password,
            });
            await loginUser({ email: form.email, password: form.password }, true);
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
            navigate("/profile");
        } catch (err) {
            setError(err.message || "Registration failed.");
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

                                <div className="login-divider">
                                    <span>identity verification</span>
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
                                    Upload ID (optional)
                                    <input type="file" accept="image/*,.pdf,.txt" onChange={handleFileChange} />
                                </label>

                                <label>
                                    Country of residence
                                    <input type="text" name="country" value={form.country} onChange={handleChange} placeholder="Country" />
                                </label>

                                <button type="submit" className="login-submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create account"}
                                </button>
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

const parseIdentityFile = (file, setForm) => {
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

