import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import { getBankAccounts, createBankAccount, updateBankAccount, deleteBankAccount } from "./Services/Service";
import { useNavigate } from "react-router-dom";

export default function Wallet() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ accountHolderName: "", bankName: "", iban: "", swiftCode: "", currency: "USD" });
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

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const startEdit = (acc) => {
    setEditing(acc?.bankAccountId ?? null);
    setForm({ accountHolderName: acc?.accountHolderName ?? "", bankName: acc?.bankName ?? "", iban: acc?.iban ?? "", swiftCode: acc?.swiftCode ?? "", currency: acc?.currency ?? "USD" });
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
      setForm({ accountHolderName: "", bankName: "", iban: "", swiftCode: "", currency: "USD" });
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 24 }}>
        <h2>Bank accounts</h2>
        <p>Manage your linked bank accounts (IBAN/SWIFT) used for fiat transfers.</p>

        <div style={{ marginBottom: 12 }}>
          <button onClick={() => navigate('/profile')} style={{ marginRight: 8 }}>Back to profile</button>
          <button onClick={() => startEdit(null)}>Add bank account</button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: '#c94a4a' }}>{error}</p>}

        {!loading && !accounts.length && <p>No bank accounts linked.</p>}

        {!loading && accounts.length > 0 && (
          <div style={{ display: 'grid', gap: 12 }}>
            {accounts.map((a) => (
              <div key={a.bankAccountId} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div><strong>{a.accountHolderName}</strong> • {a.currency}</div>
                    <div style={{ fontSize: 13, color: '#666' }}>{a.bankName}</div>
                    <div style={{ fontSize: 13, color: '#666' }}>IBAN: ****{(a.iban || '').slice(-4)}</div>
                    <div style={{ fontSize: 13, color: '#666' }}>SWIFT: {a.swiftCode}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => startEdit(a)}>Edit</button>
                    <button onClick={() => remove(a.bankAccountId)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <h3>{editing ? 'Edit bank account' : 'Add bank account'}</h3>
          <div style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
            <input name="accountHolderName" placeholder="Account holder name" value={form.accountHolderName} onChange={handleChange} />
            <input name="bankName" placeholder="Bank name" value={form.bankName} onChange={handleChange} />
            <input name="iban" placeholder="IBAN" value={form.iban} onChange={handleChange} />
            <input name="swiftCode" placeholder="SWIFT code" value={form.swiftCode} onChange={handleChange} />
            <select name="currency" value={form.currency} onChange={handleChange}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
            <div>
              <button onClick={submit} style={{ marginRight: 8 }}>{editing ? 'Save' : 'Add'}</button>
              {editing && <button onClick={() => { setEditing(null); setForm({ accountHolderName: '', bankName: '', iban: '', swiftCode: '', currency: 'USD' }); }}>Cancel</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
