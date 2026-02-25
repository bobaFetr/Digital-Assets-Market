import React, { useState } from "react";
import "./Login.css"; // reuse login styles so signup matches the login design
import { Link, useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "./Services/auth";
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
    const [uploadInfo, setUploadInfo] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
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
            setUploadInfo(`Selected file: ${file.name}. Auto-fill works with .txt ID files.`);
            return;
        }

        parseIdentityFile(file)
            .then((parsed) => {
                if (!parsed) {
                    setUploadInfo("Could not parse ID file. Please fill fields manually.");
                    return;
                }

                setForm((prev) => ({
                    ...prev,
                    ...Object.fromEntries(
                        Object.entries(parsed).filter(([, value]) => Boolean(value))
                    ),
                }));

                if (!parsed.dob) {
                    setUploadInfo("ID file loaded, but date of birth was not recognized.");
                    return;
                }

                const age = getAge(parsed.dob);
                if (!Number.isNaN(age) && age >= 18) {
                    setUploadInfo(`ID file loaded. Age check passed (${age}).`);
                    return;
                }

                setUploadInfo("ID file loaded, but age check failed (must be 18+).");
            })
            .catch(() => {
                setUploadInfo("Could not read ID file. Please try again.");
            });
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
                fullName: form.fullName,
                idNumber: form.idNumber,
                dateOfBirth: form.dob,
                expiryDate: form.expiryDate,
                country: form.country,
                documentType: form.documentType,
                idFilePath: fileName,
            });
            await loginUser({ email: form.email, password: form.password }, true);
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
                            <p className="subtext">Create your Crypto Inc ЕООД account</p>

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
                                    Upload ID document
                                    <input type="file" accept="image/*,.pdf,.txt" onChange={handleFileChange} />
                                </label>

                                <label>
                                    Uploaded document
                                    <input type="text" value={fileName || "No file selected"} readOnly />
                                </label>

                                {uploadInfo && <p className="subtext" style={{ marginTop: 0 }}>{uploadInfo}</p>}

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

const parseIdentityFile = (file) => {
    return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const content = String(event.target?.result || "");
        const parsed = parseIdentityText(content);
        resolve(parsed);
    };
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsText(file);
    });
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

    const dobRaw = lookup["date of birth"] || lookup["dob"];
    const expiryRaw = lookup["document expiry date"] || lookup["expiry date"];

    return {
        fullName: lookup["full name"] || lookup["name"] || "",
        dob: normalizeDate(dobRaw),
        idNumber: lookup["id number"] || lookup["document number"] || "",
        documentType: lookup["document type"] || "Passport",
        country: lookup["country of residence"] || lookup["country"] || "",
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

