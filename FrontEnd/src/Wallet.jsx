import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import "./wallet.css";
import {
  addMoneyFromCard,
  createBankAccount,
  deleteBankAccount,
  getBankAccounts,
  getSavedCardDetails,
  getToken,
  request,
  updateBankAccount,
} from "./Services/Service";

const formatAmount = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

function StatusMessage({ type, children }) {
  if (!children) return null;
  return <div className={`ui-alert ui-alert--${type}`}>{children}</div>;
}

export default function Wallet() {
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [accountsWarning, setAccountsWarning] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [savedCard, setSavedCard] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositCurrency, setDepositCurrency] = useState("USD");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [depositError, setDepositError] = useState("");
  const [depositSuccess, setDepositSuccess] = useState("");
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);
  const [form, setForm] = useState({
    accountHolderName: "",
    bankName: "",
    iban: "",
    swiftCode: "",
    currency: "USD",
  });
  const navigate = useNavigate();

  const pageStyle = {
    display: "flex",
    minHeight: "100vh",
    background: "var(--bg-color)",
    color: "var(--text-primary)",
  };

  const sectionStyle = {
    flex: 1,
    padding: "24px",
    color: "var(--text-primary)",
    minWidth: 0,
  };

  const panelStyle = {
    background: "var(--card-bg)",
    border: "1px solid var(--glass-border)",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  };

  const fieldStyle = {
    width: "100%",
    maxWidth: 240,
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid var(--glass-border)",
    background: "var(--card-bg)",
    color: "var(--input-text)",
    boxSizing: "border-box",
  };

  const wideFieldStyle = {
    ...fieldStyle,
    maxWidth: "100%",
  };

  const loadWalletData = async () => {
    const token = getToken();
    if (!token) {
      setError("Please sign in to view your wallets.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [walletData, accountData, txData, cardData] = await Promise.all([
        request("/api/wallets", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        getBankAccounts().catch((err) => {
          return {
            items: [],
            warning: err?.message || "Bank accounts are temporarily unavailable.",
          };
        }),
        request("/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => []),
        getSavedCardDetails().catch(() => null),
      ]);

      setWallets(Array.isArray(walletData) ? walletData : []);
      if (Array.isArray(accountData)) {
        setAccounts(accountData);
        setAccountsWarning("");
      } else {
        setAccounts(Array.isArray(accountData?.items) ? accountData.items : []);
        setAccountsWarning(accountData?.warning || "Bank accounts are temporarily unavailable.");
      }
      setTransactions(Array.isArray(txData) ? txData : []);
      setSavedCard(cardData);

      if (cardData?.currency) {
        setDepositCurrency(cardData.currency);
      }
    } catch (err) {
      setError(err.message || "Unable to load wallet data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
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

  const resetBankForm = () => {
    setEditing(null);
    setForm({
      accountHolderName: "",
      bankName: "",
      iban: "",
      swiftCode: "",
      currency: "USD",
    });
  };

  const submitBankAccount = async () => {
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

      await loadWalletData();
      resetBankForm();
    } catch (err) {
      setError(err.message || "Unable to save bank account.");
    }
  };

  const removeBankAccount = async (id) => {
    if (!window.confirm("Delete this bank account?")) {
      return;
    }

    try {
      await deleteBankAccount(id);
      await loadWalletData();
    } catch (err) {
      setError(err.message || "Unable to delete bank account.");
    }
  };

  const handleDeposit = async (event) => {
    event.preventDefault();
    setDepositError("");
    setDepositSuccess("");

    const parsedAmount = Number(depositAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setDepositError("Enter a valid deposit amount.");
      return;
    }

    const payload = {
      amount: parsedAmount,
      currency: depositCurrency,
    };

    if (!savedCard) {
      payload.cardHolderName = cardHolderName.trim();
      payload.cardNumber = cardNumber.replace(/\s+/g, "");
      payload.cvv = cardCvv.trim();
      payload.expiryDate = cardExpiry.trim();
    }

    setIsSubmittingDeposit(true);
    try {
      await addMoneyFromCard(payload);
      setDepositSuccess("Wallet funded successfully.");
      setDepositAmount("");
      setCardHolderName("");
      setCardNumber("");
      setCardCvv("");
      setCardExpiry("");
      await loadWalletData();
    } catch (err) {
      setDepositError(err.message || "Unable to complete the card deposit.");
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  return (
    <div className="wallet-page" style={pageStyle}>
      <Sidebar />
      <div className="wallet-main" style={sectionStyle}>
        <div className="wallet-topbar" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h2 style={{ marginBottom: 6 }}>Wallet & Funding</h2>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>
              Manage your platform balances, deposit with a card, and keep bank account details for withdrawals.
            </p>
          </div>
          <div className="wallet-topbar-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => navigate("/buy-sell")} className="ui-button ui-button--primary">
              Go to Buy / Sell
            </button>
            <button onClick={() => navigate("/profile")} className="ui-button ui-button--secondary">
              Back to Profile
            </button>
          </div>
        </div>

        {error && <StatusMessage type="error">{error}</StatusMessage>}
        {accountsWarning && !error ? <StatusMessage type="warning">{accountsWarning}</StatusMessage> : null}
        {loading && <StatusMessage type="info">Loading wallet data...</StatusMessage>}

        {!loading && (
          <>
            <div className="wallet-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 20 }}>
              {wallets.length > 0 ? (
                wallets.map((wallet) => (
                  <div key={wallet.walletId} style={panelStyle}>
                    <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>{wallet.currency} wallet</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "var(--brand-accent)", marginTop: 10 }}>
                      {formatAmount(wallet.balance)}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, color: "var(--text-secondary)" }}>{wallet.status}</div>
                  </div>
                ))
              ) : (
                <div style={panelStyle}>No wallets available yet.</div>
              )}
            </div>

            <div className="wallet-two-column" style={{ display: "grid", gridTemplateColumns: "minmax(320px, 420px) 1fr", gap: 20, marginTop: 24 }}>
              <section className="wallet-panel-card" style={panelStyle}>
                <h3 style={{ marginTop: 0 }}>Fund wallet with card</h3>
                <p style={{ color: "var(--text-secondary)", marginTop: 0 }}>
                  This is a demo card deposit that credits your internal platform balance.
                </p>

                <form onSubmit={handleDeposit} style={{ display: "grid", gap: 12 }}>
                  {savedCard ? (
                    <div style={{ padding: 12, borderRadius: 12, background: "var(--surface-inset)", border: "1px solid var(--glass-border)" }}>
                      <div style={{ fontWeight: 700 }}>{savedCard.cardHolderName}</div>
                      <div style={{ color: "var(--text-secondary)", marginTop: 4 }}>
                        Saved card ending in {savedCard.cardLast4} - {savedCard.expiryDate}
                      </div>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Card holder name"
                        value={cardHolderName}
                        onChange={(event) => setCardHolderName(event.target.value)}
                        style={wideFieldStyle}
                      />
                      <input
                        type="text"
                        placeholder="Card number"
                        value={cardNumber}
                        onChange={(event) => setCardNumber(event.target.value)}
                        style={wideFieldStyle}
                      />
                      <div className="wallet-inline-fields" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <input
                          type="text"
                          placeholder="CVV"
                          value={cardCvv}
                          onChange={(event) => setCardCvv(event.target.value)}
                          style={fieldStyle}
                        />
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(event) => setCardExpiry(event.target.value)}
                          style={fieldStyle}
                        />
                      </div>
                    </>
                  )}

                  <div className="wallet-inline-fields" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Amount"
                      value={depositAmount}
                      onChange={(event) => setDepositAmount(event.target.value)}
                      style={fieldStyle}
                    />
                    <select
                      value={depositCurrency}
                      onChange={(event) => setDepositCurrency(event.target.value)}
                      style={{ ...fieldStyle, maxWidth: 120 }}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <button type="submit" disabled={isSubmittingDeposit} className="ui-button ui-button--primary">
                    {isSubmittingDeposit ? "Funding..." : "Fund wallet"}
                  </button>

                  {savedCard && (
                    <button
                      type="button"
                      onClick={() => setSavedCard(null)}
                      className="ui-button ui-button--secondary"
                    >
                      Use another card
                    </button>
                  )}

                  <StatusMessage type="error">{depositError}</StatusMessage>
                  <StatusMessage type="success">{depositSuccess}</StatusMessage>
                </form>
              </section>

              <section className="wallet-panel-card" style={panelStyle}>
                <div className="wallet-panel-header" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <h3 style={{ margin: 0 }}>Recent transactions</h3>
                  <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    Latest internal activity
                  </span>
                </div>

                {transactions.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)", marginBottom: 0 }}>No transactions yet.</p>
                ) : (
                  <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                    {transactions.slice(0, 6).map((transaction) => (
                      <div
                        key={transaction.transactionId}
                        className="wallet-transaction-row"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          padding: "12px 14px",
                          borderRadius: 12,
                          background: "var(--surface-inset)",
                          border: "1px solid var(--glass-border)",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700 }}>{transaction.typeOfTransaction}</div>
                          <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                            {transaction.currency} - {transaction.status}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, color: "var(--brand-accent)" }}>
                            {formatAmount(transaction.amount)}
                          </div>
                          <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                            {transaction.timeStamp ? new Date(transaction.timeStamp).toLocaleString() : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="wallet-bottom-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, marginTop: 24 }}>
              <section className="wallet-panel-card" style={panelStyle}>
                <div className="wallet-panel-header" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <h3 style={{ margin: 0 }}>Linked bank accounts</h3>
                  <button onClick={() => startEdit(null)} className="ui-button ui-button--primary">Add bank account</button>
                </div>

                {!accounts.length && (
                  <p style={{ color: "var(--text-secondary)" }}>No bank accounts linked yet.</p>
                )}

                <div style={{ display: "grid", gap: 12 }}>
                  {accounts.map((account) => (
                    <div
                      key={account.bankAccountId}
                      className="wallet-account-card"
                      style={{
                        padding: 16,
                        border: "1px solid var(--glass-border)",
                        borderRadius: 14,
                        background: "var(--surface-inset)",
                      }}
                    >
                      <div className="wallet-account-card__content" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div>
                          <div><strong>{account.accountHolderName}</strong> - {account.currency}</div>
                          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{account.bankName}</div>
                          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>IBAN: ****{String(account.iban || "").slice(-4)}</div>
                          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>SWIFT: {account.swiftCode}</div>
                        </div>
                        <div className="wallet-account-actions" style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <button onClick={() => startEdit(account)} className="ui-button ui-button--secondary">Edit</button>
                          <button onClick={() => removeBankAccount(account.bankAccountId)} className="ui-button ui-button--secondary" style={{ color: "var(--error-main)" }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="wallet-panel-card" style={panelStyle}>
                <h3 style={{ marginTop: 0 }}>{editing ? "Edit bank account" : "Add bank account"}</h3>
                <div style={{ display: "grid", gap: 10 }}>
                  <input
                    style={wideFieldStyle}
                    name="accountHolderName"
                    placeholder="Account holder name"
                    value={form.accountHolderName}
                    onChange={handleChange}
                  />
                  <input
                    style={wideFieldStyle}
                    name="bankName"
                    placeholder="Bank name"
                    value={form.bankName}
                    onChange={handleChange}
                  />
                  <input
                    style={wideFieldStyle}
                    name="iban"
                    placeholder="IBAN"
                    value={form.iban}
                    onChange={handleChange}
                  />
                  <input
                    style={wideFieldStyle}
                    name="swiftCode"
                    placeholder="SWIFT code"
                    value={form.swiftCode}
                    onChange={handleChange}
                  />
                  <select
                    style={{ ...fieldStyle, maxWidth: 140 }}
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>

                  <div className="wallet-form-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button onClick={submitBankAccount} className="ui-button ui-button--primary">
                      {editing ? "Save changes" : "Add account"}
                    </button>
                    {editing && (
                      <button onClick={resetBankForm} className="ui-button ui-button--secondary">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
