import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "./Services/Service";
import { useNavigate } from "react-router-dom";

export default function Wallet() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    accountHolderName: "",
    bankName: "",
    iban: "",
    swiftCode: "",
    currency: "USD",
  });
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getBankAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load bank accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const startEdit = (account) => {
    setEditing(account?.bankAccountId ?? null);
    setForm({
      accountHolderName: account?.accountHolderName ?? "",
      bankName: account?.bankName ?? "",
      iban: account?.iban ?? "",
      swiftCode: account?.swiftCode ?? "",
      currency: account?.currency ?? "USD",
    });
  };

  const submit = async () => {
    setError("");
    try {
      if (editing) {
        await updateBankAccount(editing, {
          accountHolderName: form.accountHolderName,
          bankName: form.bankName,
          iban: form.iban,
          swiftCode: form.swiftCode,
          currency: form.currency,
        });
      } else {
        await createBankAccount({
          accountHolderName: form.accountHolderName,
          bankName: form.bankName,
          iban: form.iban,
          swiftCode: form.swiftCode,
          currency: form.currency,
        });
      }

      await load();
      setEditing(null);
      setForm({
        accountHolderName: "",
        bankName: "",
        iban: "",
        swiftCode: "",
        currency: "USD",
      });
    } catch (err) {
      setError(err.message || "Save failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this bank account?")) return;
    try {
      await deleteBankAccount(id);
      await load();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  const pageStyle = {
    display: "flex",
    minHeight: "100vh",
    background: "var(--bg-color)",
    color: "var(--text-primary)",
  };

  const sectionStyle = {
    flex: 1,
    padding: 24,
    color: "var(--text-primary)",
  };

  const secondaryButtonStyle = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid var(--glass-border)",
    background: "var(--card-bg)",
    color: "var(--text-primary)",
    cursor: "pointer",
  };

  const primaryButtonStyle = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid transparent",
    background: "var(--accent-blue)",
    color: "#fff",
    cursor: "pointer",
  };

  const accountCardStyle = {
    padding: 16,
    border: "1px solid var(--glass-border)",
    borderRadius: 14,
    background: "var(--card-bg)",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  };

  const fieldStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid var(--glass-border)",
    background: "var(--card-bg)",
    color: "var(--input-text)",
    boxSizing: "border-box",
  };

  return (
    <div style={pageStyle}>
      <Sidebar />
      <div style={sectionStyle}>
        <h2>Bank accounts</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Manage your linked bank accounts (IBAN/SWIFT) used for fiat transfers.
        </p>

        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => navigate("/profile")}
            style={{ ...secondaryButtonStyle, marginRight: 8 }}
          >
            Back to profile
          </button>
          <button onClick={() => startEdit(null)} style={primaryButtonStyle}>
            Add bank account
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "var(--error-main)" }}>{error}</p>}

        {!loading && !accounts.length && <p>No bank accounts linked.</p>}

        {!loading && accounts.length > 0 && (
          <div style={{ display: "grid", gap: 12 }}>
            {accounts.map((account) => (
              <div key={account.bankAccountId} style={accountCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div>
                      <strong>{account.accountHolderName}</strong> · {account.currency}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {account.bankName}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      IBAN: ****{String(account.iban || "").slice(-4)}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      SWIFT: {account.swiftCode}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => startEdit(account)}
                      style={secondaryButtonStyle}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(account.bankAccountId)}
                      style={{ ...secondaryButtonStyle, color: "var(--error-main)" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <h3>{editing ? "Edit bank account" : "Add bank account"}</h3>
          <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
            <input
              style={fieldStyle}
              name="accountHolderName"
              placeholder="Account holder name"
              value={form.accountHolderName}
              onChange={handleChange}
            />
            <input
              style={fieldStyle}
              name="bankName"
              placeholder="Bank name"
              value={form.bankName}
              onChange={handleChange}
            />
            <input
              style={fieldStyle}
              name="iban"
              placeholder="IBAN"
              value={form.iban}
              onChange={handleChange}
            />
            <input
              style={fieldStyle}
              name="swiftCode"
              placeholder="SWIFT code"
              value={form.swiftCode}
              onChange={handleChange}
            />
            <select
              style={fieldStyle}
              name="currency"
              value={form.currency}
              onChange={handleChange}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
            <div>
              <button
                onClick={submit}
                style={{ ...primaryButtonStyle, marginRight: 8 }}
              >
                {editing ? "Save" : "Add"}
              </button>
              {editing && (
                <button
                  style={secondaryButtonStyle}
                  onClick={() => {
                    setEditing(null);
                    setForm({
                      accountHolderName: "",
                      bankName: "",
                      iban: "",
                      swiftCode: "",
                      currency: "USD",
                    });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
