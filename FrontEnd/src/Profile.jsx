import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addMoneyFromCard, changePassword, deleteAccount, getProfile, getSavedCardDetails, getToken, logoutUser, updateProfilePicture, updateUserName, request } from "./Services/Service";
import { buildUrl } from "./config/api";
import Sidebar from "./Components/Sidebar";
import { isSafeUploadImageType, resolveTrustedImageUrl } from "./Security/trustedContent";

const DEFAULT_PROFILE_PICTURE = buildUrl("/OIP.webp");

const parseSymbolCurrencies = (symbol) => {
  if (!symbol || typeof symbol !== "string") return [];
  const normalized = symbol.trim().toUpperCase();
  for (const quote of ["USD", "EUR"]) {
    if (normalized.endsWith(quote) && normalized.length > quote.length) {
      return [normalized.slice(0, -quote.length), quote];
    }
  }
  return [normalized];
};

const formatBalanceValue = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });

const collectUsedCurrencies = (accountExport, bankAccounts = []) => {
  const used = new Set();
  for (const wallet of accountExport?.wallets || []) if (wallet?.currency) used.add(String(wallet.currency).toUpperCase());
  for (const transaction of accountExport?.transactions || []) if (transaction?.currency) used.add(String(transaction.currency).toUpperCase());
  for (const order of accountExport?.orders || []) for (const currency of parseSymbolCurrencies(order?.symbol)) used.add(currency);
  for (const account of bankAccounts || []) if (account?.currency) used.add(String(account.currency).toUpperCase());
  return Array.from(used).sort((a, b) => a.localeCompare(b));
};

const getWalletBalanceByCurrency = (wallets, currency) => {
  const normalized = String(currency || "").toUpperCase();
  const wallet = (wallets || []).find((item) => String(item?.currency || "").toUpperCase() === normalized);
  return Number(wallet?.balance || 0);
};

function StatusMessage({ type, children }) {
  if (!children) return null;
  return <div className={`ui-alert ui-alert--${type}`}>{children}</div>;
}

function SectionCard({ title, description, actions, children }) {
  return (
    <section className="section-card">
      <div className="section-card__header">
        <div>
          <h3 className="section-card__title">{title}</h3>
          {description ? <p className="section-card__description">{description}</p> : null}
        </div>
        {actions ? <div className="action-row">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [usedCurrencies, setUsedCurrencies] = useState([]);
  const [accountSummaryError, setAccountSummaryError] = useState("");
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [userNameInput, setUserNameInput] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [userNameSuccess, setUserNameSuccess] = useState("");
  const [isUpdatingUserName, setIsUpdatingUserName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteBankDetails, setShowDeleteBankDetails] = useState(false);
  const [bankAccountHolderName, setBankAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankIban, setBankIban] = useState("");
  const [bankSwiftCode, setBankSwiftCode] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDownloadingInfo, setIsDownloadingInfo] = useState(false);
  const [downloadInfoError, setDownloadInfoError] = useState("");
  const [downloadInfoSuccess, setDownloadInfoSuccess] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositCurrency, setDepositCurrency] = useState("USD");
  const [savedCardForDeposits, setSavedCardForDeposits] = useState(null);
  const [addMoneyError, setAddMoneyError] = useState("");
  const [addMoneySuccess, setAddMoneySuccess] = useState("");
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccountSummaryLoading, setIsAccountSummaryLoading] = useState(true);
  const navigate = useNavigate();

  const primaryText = "var(--text-primary)";
  const secondaryText = "var(--text-secondary)";
  const accentColor = "var(--brand-accent)";
  const cardBorder = "1px solid var(--glass-border)";
  const insetBackground = "var(--surface-inset)";

  const loadAccountSummary = async () => {
    const token = getToken();
    if (!token) {
      setWallets([]);
      setUsedCurrencies([]);
      setAccountSummaryError("Not authenticated.");
      setIsAccountSummaryLoading(false);
      return;
    }

    try {
      const [accountExport, bankAccounts] = await Promise.all([
        request("/api/users/me/export", { headers: { Authorization: `Bearer ${token}` } }),
        request("/api/bank-accounts", { headers: { Authorization: `Bearer ${token}` } }).catch(() => []),
      ]);
      const nextWallets = Array.isArray(accountExport?.wallets) ? accountExport.wallets : [];
      setWallets(nextWallets);
      setUsedCurrencies(collectUsedCurrencies(accountExport, Array.isArray(bankAccounts) ? bankAccounts : []));
      setAccountSummaryError("");
    } catch (err) {
      setWallets([]);
      setUsedCurrencies([]);
      setAccountSummaryError(err.message || "Unable to load account activity.");
    } finally {
      setIsAccountSummaryLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const [data, savedCard] = await Promise.all([getProfile(), getSavedCardDetails().catch(() => null)]);
        if (!isMounted) return;
        setProfile(data);
        setUserNameInput(data?.userName || "");
        setSavedCardForDeposits(savedCard);
        if (savedCard?.currency) setDepositCurrency(savedCard.currency);
      } catch (err) {
        if (isMounted) setError(err.message || "Unable to load profile.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfile();
    loadAccountSummary().catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/sign-in");
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isSafeUploadImageType(file.type)) return setUploadError("Please select a PNG, JPG, GIF, or WEBP image.");
    if (file.size > 5 * 1024 * 1024) return setUploadError("Image is too large. Please choose one under 5MB.");

    setUploadError("");
    setIsUploadingPicture(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const updated = await updateProfilePicture(dataUrl);
      setProfile((prev) => ({ ...(prev || {}), profilePictureUrl: updated?.profilePictureUrl || dataUrl }));
    } catch (err) {
      setUploadError(err.message || "Unable to update profile picture.");
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleUpdateUserName = async (event) => {
    event.preventDefault();
    setUserNameError("");
    setUserNameSuccess("");
    const normalizedUserName = userNameInput.trim();
    if (!normalizedUserName) return setUserNameError("Username is required.");
    if (normalizedUserName.length < 3) return setUserNameError("Username must be at least 3 characters.");

    setIsUpdatingUserName(true);
    try {
      const updated = await updateUserName(normalizedUserName);
      setProfile((prev) => ({ ...(prev || {}), userName: updated?.userName || normalizedUserName }));
      setUserNameInput(updated?.userName || normalizedUserName);
      setUserNameSuccess("Username updated successfully.");
    } catch (err) {
      setUserNameError(err.message || "Unable to update username.");
    } finally {
      setIsUpdatingUserName(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) return setPasswordError("All password fields are required.");
    if (newPassword.length < 8) return setPasswordError("New password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setPasswordError("New password and confirmation do not match.");

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message || "Unable to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    setDeleteError("");
    if (!deletePassword) return setDeleteError("Please enter your current password to delete account.");
    if (showDeleteBankDetails && (!bankAccountHolderName.trim() || !bankName.trim() || !bankIban.trim() || !bankSwiftCode.trim())) {
      return setDeleteError("Please fill all bank account fields to continue.");
    }

    const shouldDelete = window.confirm(showDeleteBankDetails ? "Confirm transfer to your bank account and deactivate profile?" : "Are you sure you want to continue with account deletion?");
    if (!shouldDelete) return;

    setIsDeletingAccount(true);
    try {
      await deleteAccount({
        currentPassword: deletePassword,
        bankAccountHolderName: showDeleteBankDetails ? bankAccountHolderName.trim() : undefined,
        bankName: showDeleteBankDetails ? bankName.trim() : undefined,
        iban: showDeleteBankDetails ? bankIban.trim() : undefined,
        swiftCode: showDeleteBankDetails ? bankSwiftCode.trim() : undefined,
      });
      logoutUser();
      navigate("/sign-in");
    } catch (err) {
      const message = err.message || "Unable to delete account.";
      if (message.includes("Bank account details are required before deleting your profile.")) {
        setShowDeleteBankDetails(true);
        setDeleteError("Enter your personal bank account details, then press Confirm and Delete.");
      } else {
        setDeleteError(message);
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleDownloadAccountInfo = async () => {
    setDownloadInfoError("");
    setDownloadInfoSuccess("");
    const token = getToken();
    if (!token) return setDownloadInfoError("Not authenticated.");

    setIsDownloadingInfo(true);
    try {
      const data = await request("/api/users/me/export", { headers: { Authorization: `Bearer ${token}` } });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `account-info-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDownloadInfoSuccess("Account export is ready and has been downloaded.");
    } catch (err) {
      setDownloadInfoError(err.message || "Unable to download account info.");
    } finally {
      setIsDownloadingInfo(false);
    }
  };

  const handleAddMoney = async (event) => {
    event.preventDefault();
    setAddMoneyError("");
    setAddMoneySuccess("");
    const parsedAmount = Number(depositAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return setAddMoneyError("Amount must be greater than zero.");

    let normalizedCardHolder = "";
    let normalizedCardNumber = "";
    let normalizedCvv = "";
    let normalizedExpiry = "";
    if (!savedCardForDeposits) {
      normalizedCardHolder = cardHolderName.trim();
      normalizedCardNumber = cardNumber.replace(/\s+/g, "");
      normalizedCvv = cardCvv.trim();
      normalizedExpiry = cardExpiry.trim();
      if (!normalizedCardHolder) return setAddMoneyError("Card holder name is required.");
      if (!/^\d{12,19}$/.test(normalizedCardNumber)) return setAddMoneyError("Card number must be 12-19 digits.");
      if (!/^\d{3,4}$/.test(normalizedCvv)) return setAddMoneyError("CVV must be 3 or 4 digits.");
      if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(normalizedExpiry)) return setAddMoneyError("Expiry date must be in MM/YY format.");
    }

    setIsAddingMoney(true);
    try {
      await addMoneyFromCard({
        cardNumber: normalizedCardNumber,
        cardHolderName: normalizedCardHolder,
        cvv: normalizedCvv,
        expiryDate: normalizedExpiry,
        amount: parsedAmount,
        currency: depositCurrency,
      });
      setAddMoneySuccess("Money added successfully.");
      setCardNumber("");
      setCardHolderName("");
      setCardCvv("");
      setCardExpiry("");
      setDepositAmount("");
      if (!savedCardForDeposits) {
        const savedCard = await getSavedCardDetails().catch(() => null);
        if (savedCard) {
          setSavedCardForDeposits(savedCard);
          setDepositCurrency(savedCard.currency || depositCurrency);
        }
      }
      setIsAccountSummaryLoading(true);
      await loadAccountSummary();
    } catch (err) {
      setAddMoneyError(err.message || "Unable to add money.");
    } finally {
      setIsAddingMoney(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-color)", color: primaryText }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 24 }}>
        <div className="page-header" style={{ marginBottom: 20 }}>
          <div>
            <h2 style={{ color: accentColor }}>My Profile</h2>
            <p className="page-subtitle">
              Manage your personal information, internal wallets, card funding, security settings, and account export from one place.
            </p>
          </div>
          <div className="action-row">
            <button className="ui-button ui-button--primary" onClick={() => navigate("/wallets")}>Open Wallets</button>
            <button className="ui-button ui-button--info" onClick={() => navigate("/VerifyIdentityPage")}>Identity Verification</button>
            <button className="ui-button ui-button--secondary" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="section-grid" style={{ marginBottom: 20 }}>
          <SectionCard title="Profile Overview" description="Your demo account identity, profile picture, and quick account summary.">
            {isLoading ? <StatusMessage type="info">Loading profile...</StatusMessage> : null}
            {!isLoading && error ? <StatusMessage type="error">{error}</StatusMessage> : null}
            {!isLoading && !error ? (
              <div className="section-grid" style={{ gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "120px minmax(0, 1fr)", gap: 18, alignItems: "center" }}>
                  <div style={{ width: 100, height: 100, borderRadius: "50%", overflow: "hidden", border: `2px solid ${accentColor}`, background: insetBackground }}>
                    <img
                      src={resolveTrustedImageUrl(profile?.profilePictureUrl, DEFAULT_PROFILE_PICTURE, buildUrl)}
                      alt="Profile"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(event) => {
                        event.currentTarget.src = DEFAULT_PROFILE_PICTURE;
                      }}
                    />
                  </div>
                  <div className="section-grid" style={{ gap: 10 }}>
                    <div className="ui-field-row" style={{ alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>{profile?.userName || "-"}</div>
                        <div style={{ color: secondaryText }}>{profile?.email || "-"}</div>
                        <div style={{ color: secondaryText, marginTop: 4 }}>Role: {profile?.role || "User"}</div>
                      </div>
                      <label className="ui-button ui-button--secondary" style={{ display: "inline-flex", alignItems: "center" }}>
                        {isUploadingPicture ? "Uploading..." : "Change Picture"}
                        <input type="file" accept="image/*" onChange={handleProfilePictureChange} disabled={isUploadingPicture} style={{ display: "none" }} />
                      </label>
                    </div>
                    <StatusMessage type="error">{uploadError}</StatusMessage>
                  </div>
                </div>

                {isAccountSummaryLoading ? <StatusMessage type="info">Loading wallet summary...</StatusMessage> : null}
                {!isAccountSummaryLoading && accountSummaryError ? <StatusMessage type="warning">{accountSummaryError}</StatusMessage> : null}
                {!isAccountSummaryLoading && !accountSummaryError ? (
                  <div className="section-grid" style={{ gap: 16 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: accentColor, marginBottom: 10 }}>Fiat balances</div>
                      <div className="stat-grid">
                        {["EUR", "USD"].map((currency) => (
                          <div key={currency} className="stat-card">
                            <div className="stat-card__label">{currency} internal balance</div>
                            <div className="stat-card__value">{formatBalanceValue(getWalletBalanceByCurrency(wallets, currency))} {currency}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, color: accentColor, marginBottom: 10 }}>Currencies used</div>
                      <div className="tag-row">
                        {usedCurrencies.length > 0 ? usedCurrencies.map((currency) => <span key={currency} className="tag-pill">{currency}</span>) : <span style={{ color: secondaryText }}>No currencies used yet.</span>}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, color: accentColor, marginBottom: 10 }}>Wallet balances</div>
                      <div className="section-grid" style={{ gap: 8 }}>
                        {wallets.length > 0 ? wallets.map((wallet) => (
                          <div
                            key={wallet.walletID || wallet.walletId || `${wallet.currency}-${wallet.createdAt}`}
                            style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 12, background: insetBackground, border: cardBorder }}
                          >
                            <span>{wallet.currency}</span>
                            <strong style={{ color: accentColor }}>{formatBalanceValue(wallet.balance)}</strong>
                          </div>
                        )) : <span style={{ color: secondaryText }}>No wallets available.</span>}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </SectionCard>
        </div>

        <div className="section-grid section-grid--two" style={{ marginBottom: 20 }}>
          <SectionCard
            title="Personal Details"
            description="Update your username and export your account data when you need a full activity snapshot."
            actions={<button className="ui-button ui-button--secondary" onClick={handleDownloadAccountInfo} disabled={isDownloadingInfo}>{isDownloadingInfo ? "Preparing export..." : "Download Account Export"}</button>}
          >
            <form onSubmit={handleUpdateUserName} className="ui-form-grid">
              <input type="text" placeholder="Username" value={userNameInput} onChange={(event) => setUserNameInput(event.target.value)} className="ui-input" />
              <div className="action-row">
                <button type="submit" className="ui-button ui-button--primary" disabled={isUpdatingUserName}>{isUpdatingUserName ? "Updating..." : "Update Username"}</button>
              </div>
              <StatusMessage type="error">{userNameError}</StatusMessage>
              <StatusMessage type="success">{userNameSuccess}</StatusMessage>
              <StatusMessage type="error">{downloadInfoError}</StatusMessage>
              <StatusMessage type="success">{downloadInfoSuccess}</StatusMessage>
            </form>
          </SectionCard>

          <SectionCard
            title="Fund Internal Wallet"
            description="Add demo money with a card. This simulates a platform deposit and updates your internal wallet balance."
            actions={<button className="ui-button ui-button--secondary" onClick={() => navigate("/wallets")}>Manage Wallets</button>}
          >
            <form onSubmit={handleAddMoney} className="ui-form-grid">
              {savedCardForDeposits ? (
                <>
                  <StatusMessage type="info">Using saved card: {savedCardForDeposits.cardHolderName} ending in {savedCardForDeposits.cardLast4}.</StatusMessage>
                  <div style={{ padding: 14, borderRadius: 14, border: cardBorder, background: insetBackground, display: "grid", gap: 6 }}>
                    <div><strong>Holder:</strong> {savedCardForDeposits.cardHolderName}</div>
                    <div><strong>Last 4:</strong> {savedCardForDeposits.cardLast4}</div>
                    <div><strong>Expiry:</strong> {savedCardForDeposits.expiryDate}</div>
                    <div><strong>Currency:</strong> {savedCardForDeposits.currency}</div>
                  </div>
                </>
              ) : (
                <>
                  <input type="text" placeholder="Card holder name" value={cardHolderName} onChange={(event) => setCardHolderName(event.target.value)} className="ui-input" />
                  <input type="text" placeholder="Card number" value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} className="ui-input" />
                  <div className="ui-field-row">
                    <input type="text" placeholder="CVV" value={cardCvv} onChange={(event) => setCardCvv(event.target.value)} className="ui-input ui-input--compact" />
                    <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={(event) => setCardExpiry(event.target.value)} className="ui-input ui-input--compact" />
                  </div>
                </>
              )}
              <div className="ui-field-row">
                <input type="number" step="0.01" min="0" placeholder="Amount" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} className="ui-input ui-input--compact" />
                <select value={depositCurrency} onChange={(event) => setDepositCurrency(event.target.value)} className="ui-select ui-select--compact">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <StatusMessage type="info">Deposit the amount into your internal {depositCurrency} wallet balance. This is a simulated card funding flow.</StatusMessage>
              <div className="action-row">
                <button type="submit" className="ui-button ui-button--primary" disabled={isAddingMoney}>{isAddingMoney ? "Adding..." : "Add Money"}</button>
                {savedCardForDeposits ? (
                  <button
                    type="button"
                    className="ui-button ui-button--secondary"
                    onClick={() => {
                      setSavedCardForDeposits(null);
                      setDepositCurrency("USD");
                      setAddMoneySuccess("");
                      setAddMoneyError("");
                    }}
                  >
                    Use Another Card
                  </button>
                ) : null}
              </div>
              <StatusMessage type="error">{addMoneyError}</StatusMessage>
              <StatusMessage type="success">{addMoneySuccess}</StatusMessage>
            </form>
          </SectionCard>
        </div>

        <div className="section-grid section-grid--two">
          <SectionCard title="Security and Access" description="Change your password and keep your account access details up to date.">
            <form onSubmit={handleChangePassword} className="ui-form-grid">
              <input type="password" placeholder="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="ui-input" />
              <input type="password" placeholder="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="ui-input" />
              <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="ui-input" />
              <div className="action-row">
                <button type="submit" className="ui-button ui-button--primary" disabled={isChangingPassword}>{isChangingPassword ? "Changing..." : "Update Password"}</button>
              </div>
              <StatusMessage type="error">{passwordError}</StatusMessage>
              <StatusMessage type="success">{passwordSuccess}</StatusMessage>
            </form>
          </SectionCard>

          <SectionCard title="Danger Zone" description="Delete the account only if you really want to remove your demo access and wallet records.">
            <StatusMessage type="warning">This action is intended for account closure. If the backend requires a bank transfer before deletion, the personal bank fields will appear below.</StatusMessage>
            <form onSubmit={handleDeleteAccount} className="ui-form-grid" style={{ marginTop: 12 }}>
              <input type="password" placeholder="Current password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} className="ui-input" />
              {showDeleteBankDetails ? (
                <>
                  <input type="text" placeholder="Bank account holder name" value={bankAccountHolderName} onChange={(event) => setBankAccountHolderName(event.target.value)} className="ui-input" />
                  <input type="text" placeholder="Bank name" value={bankName} onChange={(event) => setBankName(event.target.value)} className="ui-input" />
                  <input type="text" placeholder="IBAN" value={bankIban} onChange={(event) => setBankIban(event.target.value)} className="ui-input" />
                  <input type="text" placeholder="SWIFT code" value={bankSwiftCode} onChange={(event) => setBankSwiftCode(event.target.value)} className="ui-input" />
                </>
              ) : null}
              <div className="action-row">
                <button type="submit" className="ui-button ui-button--danger" disabled={isDeletingAccount}>
                  {isDeletingAccount ? "Deleting..." : showDeleteBankDetails ? "Confirm and Delete" : "Delete Account"}
                </button>
              </div>
              <StatusMessage type="error">{deleteError}</StatusMessage>
            </form>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
