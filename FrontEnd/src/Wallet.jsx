import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import "./wallet.css";
import { addMoneyFromCard, createBankAccount, deleteBankAccount, getBankAccounts, getSavedCardDetails, getToken, request, updateBankAccount } from "./Services/Service";
const formatAmount = value => Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6
});
function StatusMessage({
  type,
  children
}) {
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
    currency: "USD"
  });
  const navigate = useNavigate();
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
      const [walletData, accountData, txData, cardData] = await Promise.all([request("/api/wallets", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }), getBankAccounts().catch(err => {
        return {
          items: [],
          warning: err?.message || "Bank accounts are temporarily unavailable."
        };
      }), request("/api/transactions", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).catch(() => []), getSavedCardDetails().catch(() => null)]);
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
  const handleChange = event => {
    const {
      name,
      value
    } = event.target;
    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  };
  const startEdit = account => {
    setEditing(account?.bankAccountId ?? null);
    setForm({
      accountHolderName: account?.accountHolderName ?? "",
      bankName: account?.bankName ?? "",
      iban: account?.iban ?? "",
      swiftCode: account?.swiftCode ?? "",
      currency: account?.currency ?? "USD"
    });
  };
  const resetBankForm = () => {
    setEditing(null);
    setForm({
      accountHolderName: "",
      bankName: "",
      iban: "",
      swiftCode: "",
      currency: "USD"
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
          currency: form.currency
        });
      } else {
        await createBankAccount({
          accountHolderName: form.accountHolderName,
          bankName: form.bankName,
          iban: form.iban,
          swiftCode: form.swiftCode,
          currency: form.currency
        });
      }
      await loadWalletData();
      resetBankForm();
    } catch (err) {
      setError(err.message || "Unable to save bank account.");
    }
  };
  const removeBankAccount = async id => {
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
  const handleDeposit = async event => {
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
      currency: depositCurrency
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
  return <div className="wallet-page">
      <Sidebar />
      <div className="wallet-main">
        <div className="wallet-topbar">
          <div>
            <h2>Wallet & Funding</h2>
            <p>
              Manage your platform balances, deposit with a card, and keep bank account details for withdrawals.
            </p>
          </div>
          <div className="wallet-topbar-actions">
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

        {!loading && <>
            <div className="wallet-summary-grid">
              {wallets.length > 0 ? wallets.map(wallet => <div key={wallet.walletId}>
                    <div>{wallet.currency} wallet</div>
                    <div>
                      {formatAmount(wallet.balance)}
                    </div>
                    <div>{wallet.status}</div>
                  </div>) : <div>No wallets available yet.</div>}
            </div>

            <div className="wallet-two-column">
              <section className="wallet-panel-card">
                <h3>Fund wallet with card</h3>
                <p>
                  This is a demo card deposit that credits your internal platform balance.
                </p>

                <form onSubmit={handleDeposit}>
                  {savedCard ? <div>
                      <div>{savedCard.cardHolderName}</div>
                      <div>
                        Saved card ending in {savedCard.cardLast4} - {savedCard.expiryDate}
                      </div>
                    </div> : <>
                      <input type="text" placeholder="Card holder name" value={cardHolderName} onChange={event => setCardHolderName(event.target.value)} />


                      <input type="text" placeholder="Card number" value={cardNumber} onChange={event => setCardNumber(event.target.value)} />


                      <div className="wallet-inline-fields">
                        <input type="text" placeholder="CVV" value={cardCvv} onChange={event => setCardCvv(event.target.value)} />


                        <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={event => setCardExpiry(event.target.value)} />


                      </div>
                    </>}

                  <div className="wallet-inline-fields">
                    <input type="number" step="0.01" min="0" placeholder="Amount" value={depositAmount} onChange={event => setDepositAmount(event.target.value)} />


                    <select value={depositCurrency} onChange={event => setDepositCurrency(event.target.value)}>


                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <button type="submit" disabled={isSubmittingDeposit} className="ui-button ui-button--primary">
                    {isSubmittingDeposit ? "Funding..." : "Fund wallet"}
                  </button>

                  {savedCard && <button type="button" onClick={() => setSavedCard(null)} className="ui-button ui-button--secondary">

                      Use another card
                    </button>}

                  <StatusMessage type="error">{depositError}</StatusMessage>
                  <StatusMessage type="success">{depositSuccess}</StatusMessage>
                </form>
              </section>

              <section className="wallet-panel-card">
                <div className="wallet-panel-header">
                  <h3>Recent transactions</h3>
                  <span>
                    Latest internal activity
                  </span>
                </div>

                {transactions.length === 0 ? <p>No transactions yet.</p> : <div>
                    {transactions.slice(0, 6).map(transaction => <div key={transaction.transactionId} className="wallet-transaction-row">










                        <div>
                          <div>{transaction.typeOfTransaction}</div>
                          <div>
                            {transaction.currency} - {transaction.status}
                          </div>
                        </div>
                        <div>
                          <div>
                            {formatAmount(transaction.amount)}
                          </div>
                          <div>
                            {transaction.timeStamp ? new Date(transaction.timeStamp).toLocaleString() : ""}
                          </div>
                        </div>
                      </div>)}
                  </div>}
              </section>
            </div>

            <div className="wallet-bottom-grid">
              <section className="wallet-panel-card">
                <div className="wallet-panel-header">
                  <h3>Linked bank accounts</h3>
                  <button onClick={() => startEdit(null)} className="ui-button ui-button--primary">Add bank account</button>
                </div>

                {!accounts.length && <p>No bank accounts linked yet.</p>}

                <div>
                  {accounts.map(account => <div key={account.bankAccountId} className="wallet-account-card">







                      <div className="wallet-account-card__content">
                        <div>
                          <div><strong>{account.accountHolderName}</strong> - {account.currency}</div>
                          <div>{account.bankName}</div>
                          <div>IBAN: ****{String(account.iban || "").slice(-4)}</div>
                          <div>SWIFT: {account.swiftCode}</div>
                        </div>
                        <div className="wallet-account-actions">
                          <button onClick={() => startEdit(account)} className="ui-button ui-button--secondary">Edit</button>
                          <button onClick={() => removeBankAccount(account.bankAccountId)} className="ui-button ui-button--secondary">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>)}
                </div>
              </section>

              <section className="wallet-panel-card">
                <h3>{editing ? "Edit bank account" : "Add bank account"}</h3>
                <div>
                  <input name="accountHolderName" placeholder="Account holder name" value={form.accountHolderName} onChange={handleChange} />

                  <input name="bankName" placeholder="Bank name" value={form.bankName} onChange={handleChange} />

                  <input name="iban" placeholder="IBAN" value={form.iban} onChange={handleChange} />

                  <input name="swiftCode" placeholder="SWIFT code" value={form.swiftCode} onChange={handleChange} />

                  <select name="currency" value={form.currency} onChange={handleChange}>

                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>

                  <div className="wallet-form-actions">
                    <button onClick={submitBankAccount} className="ui-button ui-button--primary">
                      {editing ? "Save changes" : "Add account"}
                    </button>
                    {editing && <button onClick={resetBankForm} className="ui-button ui-button--secondary">
                        Cancel
                      </button>}
                  </div>
                </div>
              </section>
            </div>
          </>}
      </div>
    </div>;
}
