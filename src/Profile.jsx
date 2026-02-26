import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addMoneyFromCard, changePassword, deleteAccount, getProfile, getSavedCardDetails, getToken, logoutUser, updateProfilePicture, updateUserName } from "./Services/auth";
import Sidebar from "./Components/Sidebar";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5149";
const DEFAULT_PROFILE_PICTURE = `${API_BASE}/OIP.webp`;

const resolveProfileImageUrl = (value) => {
  if (!value) {
    return DEFAULT_PROFILE_PICTURE;
  }

  if (value.startsWith("data:image/") || /^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_BASE}${value}`;
  }

  return value;
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [balanceError, setBalanceError] = useState("");
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
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const navigate = useNavigate();

  const loadBalance = async () => {
    const token = getToken();
    if (!token) {
      setBalance(null);
      setBalanceError("Not authenticated.");
      setIsBalanceLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/wallets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const wallets = await response.json();
      const total = wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0);

      setBalance(total);
      setBalanceError("");
    } catch (err) {
      setBalance(null);
      setBalanceError(err.message || "Unable to load balance.");
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const [data, savedCard] = await Promise.all([
          getProfile(),
          getSavedCardDetails().catch(() => null),
        ]);

        if (isMounted) {
          setProfile(data);
          setUserNameInput(data?.userName || "");
          setSavedCardForDeposits(savedCard);
          if (savedCard?.currency) {
            setDepositCurrency(savedCard.currency);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load profile.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();
    loadBalance().catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const formattedBalance =
    typeof balance === "number"
      ? balance.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : null;

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

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image is too large. Please choose one under 5MB.");
      return;
    }

    setUploadError("");
    setIsUploadingPicture(true);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const updated = await updateProfilePicture(dataUrl);
      setProfile((prev) => ({
        ...(prev || {}),
        profilePictureUrl: updated?.profilePictureUrl || dataUrl,
      }));
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
    if (!normalizedUserName) {
      setUserNameError("Username is required.");
      return;
    }

    if (normalizedUserName.length < 3) {
      setUserNameError("Username must be at least 3 characters.");
      return;
    }

    setIsUpdatingUserName(true);
    try {
      const updated = await updateUserName(normalizedUserName);
      setProfile((prev) => ({
        ...(prev || {}),
        userName: updated?.userName || normalizedUserName,
      }));
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

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

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

    if (!deletePassword) {
      setDeleteError("Please enter your current password to delete account.");
      return;
    }

    if (showDeleteBankDetails) {
      if (!bankAccountHolderName.trim() || !bankName.trim() || !bankIban.trim() || !bankSwiftCode.trim()) {
        setDeleteError("Please fill all bank account fields to continue.");
        return;
      }
    }

    const shouldDelete = window.confirm(
      showDeleteBankDetails
        ? "Confirm transfer to your bank account and deactivate profile?"
        : "Are you sure you want to continue with account deletion?"
    );
    if (!shouldDelete) {
      return;
    }

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

    const token = getToken();
    if (!token) {
      setDownloadInfoError("Not authenticated.");
      return;
    }

    setIsDownloadingInfo(true);
    try {
      const response = await fetch(`${API_BASE}/api/users/me/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileStamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = url;
      link.download = `account-info-${fileStamp}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
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

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAddMoneyError("Amount must be greater than zero.");
      return;
    }

    let normalizedCardHolder = "";
    let normalizedCardNumber = "";
    let normalizedCvv = "";
    let normalizedExpiry = "";
    let normalizedCurrency = depositCurrency;

    if (savedCardForDeposits) {
      normalizedCardHolder = "";
      normalizedCardNumber = "";
      normalizedCvv = "";
      normalizedExpiry = "";
      normalizedCurrency = savedCardForDeposits.currency;
    } else {
      normalizedCardHolder = cardHolderName.trim();
      normalizedCardNumber = cardNumber.replace(/\s+/g, "");
      normalizedCvv = cardCvv.trim();
      normalizedExpiry = cardExpiry.trim();
      normalizedCurrency = depositCurrency;

      if (!normalizedCardHolder) {
        setAddMoneyError("Card holder name is required.");
        return;
      }

      if (!/^\d{12,19}$/.test(normalizedCardNumber)) {
        setAddMoneyError("Card number must be 12-19 digits.");
        return;
      }

      if (!/^\d{3,4}$/.test(normalizedCvv)) {
        setAddMoneyError("CVV must be 3 or 4 digits.");
        return;
      }

      if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(normalizedExpiry)) {
        setAddMoneyError("Expiry date must be in MM/YY format.");
        return;
      }
    }

    setIsAddingMoney(true);
    try {
      await addMoneyFromCard({
        cardNumber: normalizedCardNumber,
        cardHolderName: normalizedCardHolder,
        cvv: normalizedCvv,
        expiryDate: normalizedExpiry,
        amount: parsedAmount,
        currency: normalizedCurrency,
      });

      setAddMoneySuccess("Money added successfully.");

      if (!savedCardForDeposits) {
        const savedCard = await getSavedCardDetails().catch(() => null);
        if (savedCard) {
          setSavedCardForDeposits(savedCard);
          setDepositCurrency(savedCard.currency || normalizedCurrency);
        }
      }

      setCardNumber("");
      setCardHolderName("");
      setCardCvv("");
      setCardExpiry("");
      setDepositAmount("");
      setIsBalanceLoading(true);
      await loadBalance();
    } catch (err) {
      setAddMoneyError(err.message || "Unable to add money.");
    } finally {
      setIsAddingMoney(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "var(--background-main, #fff)",
        color: "var(--text-main, #222)",
        fontFamily: "Arial"
      }}
    >
      {/* Sidebar */}
      <Sidebar />


      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <h2>Profile Page</h2>

        {/* User Info Section */}
        <div style={{ background: "var(--background-card, #f7f7fa)", padding: "20px", borderRadius: "12px", marginTop: "20px" }}>
          <div
            className="Profile_Picture"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "var(--background-profile, #e0e4f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "bold",
              color: "var(--accent-main, #7f8cff)",
              overflow: "hidden",
            }}
          >
            {profile?.profilePictureUrl ? (
              <img
                src={resolveProfileImageUrl(profile?.profilePictureUrl)}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(event) => {
                  event.currentTarget.src = DEFAULT_PROFILE_PICTURE;
                }}
              />
            ) : (
              <img
                src={DEFAULT_PROFILE_PICTURE}
                alt="Default profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
          <div style={{ marginTop: "12px" }}>
            <label
              style={{
                display: "inline-block",
                padding: "10px 14px",
                borderRadius: "8px",
                background: isUploadingPicture ? "var(--button-disabled, #c3c3c3)" : "var(--accent-main, #7f8cff)",
                color: "#fff",
                cursor: isUploadingPicture ? "not-allowed" : "pointer",
              }}
            >
              {isUploadingPicture ? "Uploading..." : "Change Profile Picture"}
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                disabled={isUploadingPicture}
                style={{ display: "none" }}
              />
            </label>
            {uploadError && <p style={{ marginTop: "8px", color: "var(--error-main, #ff8d8d)" }}>{uploadError}</p>}
          </div>
          <h3>User Information</h3>
          {isLoading && <p style={{ marginTop: "10px" }}>Loading profile...</p>}
          {error && <p style={{ marginTop: "10px", color: "var(--error-main, #ff8d8d)" }}>{error}</p>}
          {!isLoading && !error && (
            <>
              <p style={{ marginTop: "10px" }}>Username: {profile?.userName || "-"}</p>
              <p style={{ marginTop: "10px" }}>Email: {profile?.email}</p>
              <p>Role: {profile?.role}</p>
              {isBalanceLoading && <p>Balance: Loading...</p>}
              {!isBalanceLoading && balanceError && <p style={{ color: "#ff8d8d" }}>Balance: unavailable</p>}
              {!isBalanceLoading && !balanceError && <p>Balance: ${formattedBalance}</p>}
            </>
          )}
          <form onSubmit={handleUpdateUserName} style={{ marginTop: "14px", display: "grid", gap: "8px", maxWidth: "320px" }}>
            <input
              type="text"
              placeholder="Change username"
              value={userNameInput}
              onChange={(event) => setUserNameInput(event.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border-main, #c3c3c3)",
                background: "var(--input-background, #fff)",
                color: "var(--text-main, #222)"
              }}
            />
            <button
              type="submit"
              disabled={isUpdatingUserName}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "none",
                background: isUpdatingUserName ? "var(--button-disabled, #c3c3c3)" : "var(--accent-main, #7f8cff)",
                color: "#fff",
                cursor: isUpdatingUserName ? "not-allowed" : "pointer",
              }}
            >
              {isUpdatingUserName ? "Updating..." : "Update Username"}
            </button>
            {userNameError && <p style={{ margin: 0, color: "var(--error-main, #ff8d8d)" }}>{userNameError}</p>}
            {userNameSuccess && <p style={{ margin: 0, color: "var(--success-main, #7cf29a)" }}>{userNameSuccess}</p>}
          </form>
          <div className="TransactionHistory">
            <button>Transaction History</button>
          </div>
          <div className="AddMoney">
            <form onSubmit={handleAddMoney} style={{ display: "grid", gap: "10px", marginTop: "10px", maxWidth: "360px" }}>
              <h4 style={{ margin: 0 }}>Add Money from Card</h4>
              {savedCardForDeposits && (
                <div style={{ color: "var(--accent-main, #7f8cff)", fontSize: "13px" }}>
                  Using saved card: {savedCardForDeposits.cardHolderName} •••• {savedCardForDeposits.cardLast4} ({savedCardForDeposits.currency})
                </div>
              )}

              {savedCardForDeposits && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", background: "var(--input-background, #fff)", borderRadius: "8px", overflow: "hidden" }}>
                  <thead>
                    <tr style={{ background: "var(--background-table-header, #e0e4f7)" }}>
                      <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--border-main, #c3c3c3)" }}>Credit Card ID</th>
                      <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--border-main, #c3c3c3)" }}>Holder</th>
                      <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--border-main, #c3c3c3)" }}>Last 4</th>
                      <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--border-main, #c3c3c3)" }}>Expiry</th>
                      <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid var(--border-main, #c3c3c3)" }}>Currency</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--border-main, #c3c3c3)" }}>{savedCardForDeposits.creditCardId || savedCardForDeposits.userId}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--border-main, #c3c3c3)" }}>{savedCardForDeposits.cardHolderName}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--border-main, #c3c3c3)" }}>{savedCardForDeposits.cardLast4}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--border-main, #c3c3c3)" }}>{savedCardForDeposits.expiryDate}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid var(--border-main, #c3c3c3)" }}>{savedCardForDeposits.currency}</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {!savedCardForDeposits && (
                <>
                  <input
                    type="text"
                    placeholder="Card holder name"
                    value={cardHolderName}
                    onChange={(event) => setCardHolderName(event.target.value)}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-main, #c3c3c3)", background: "var(--input-background, #fff)", color: "var(--text-main, #222)" }}
                  />
                  <input
                    type="text"
                    placeholder="Card number"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-main, #c3c3c3)", background: "var(--input-background, #fff)", color: "var(--text-main, #222)" }}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <input
                      type="text"
                      placeholder="CVV"
                      value={cardCvv}
                      onChange={(event) => setCardCvv(event.target.value)}
                      style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-main, #c3c3c3)", background: "var(--input-background, #fff)", color: "var(--text-main, #222)" }}
                    />
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(event) => setCardExpiry(event.target.value)}
                      style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-main, #c3c3c3)", background: "var(--input-background, #fff)", color: "var(--text-main, #222)" }}
                    />
                  </div>
                </>
              )}

              <div style={{ display: "grid", gridTemplateColumns: savedCardForDeposits ? "1fr" : "1fr 120px", gap: "10px" }}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Amount"
                  value={depositAmount}
                  onChange={(event) => setDepositAmount(event.target.value)}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-main, #c3c3c3)", background: "var(--input-background, #fff)", color: "var(--text-main, #222)" }}
                />
                {!savedCardForDeposits && (
                  <select
                    value={depositCurrency}
                    onChange={(event) => setDepositCurrency(event.target.value)}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-main, #c3c3c3)", background: "var(--input-background, #fff)", color: "var(--text-main, #222)" }}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                )}
              </div>
              <button
                type="submit"
                disabled={isAddingMoney}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: isAddingMoney ? "var(--button-disabled, #c3c3c3)" : "var(--accent-main, #7f8cff)",
                  color: "#fff",
                  cursor: isAddingMoney ? "not-allowed" : "pointer",
                }}
              >
                {isAddingMoney ? "Adding..." : "Add Money"}
              </button>
              {savedCardForDeposits && (
                <button
                  type="button"
                  onClick={() => {
                    setSavedCardForDeposits(null);
                    setDepositCurrency("USD");
                    setAddMoneySuccess("");
                    setAddMoneyError("");
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-main, #c3c3c3)",
                    background: "var(--input-background, #fff)",
                    color: "var(--text-main, #222)",
                    cursor: "pointer",
                  }}
                >
                  Use another card
                </button>
              )}
              {addMoneyError && <p style={{ margin: 0, color: "var(--error-main, #ff8d8d)" }}>{addMoneyError}</p>}
              {addMoneySuccess && <p style={{ margin: 0, color: "var(--success-main, #7cf29a)" }}>{addMoneySuccess}</p>}
            </form>
          </div>
          <div>
            <button onClick={handleDownloadAccountInfo} disabled={isDownloadingInfo}>
              {isDownloadingInfo ? "Preparing download..." : "Download all your account info"}
            </button>
            {downloadInfoError && <p style={{ marginTop: "8px", color: "var(--error-main, #ff8d8d)" }}>{downloadInfoError}</p>}
          </div>
          <div className="DeleteAcccountButton">
            <form onSubmit={handleDeleteAccount} style={{ display: "grid", gap: "10px", marginTop: "10px", maxWidth: "320px" }}>
              <input
                type="password"
                placeholder="Current password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-main, #c3c3c3)", background: "var(--input-background, #fff)", color: "var(--text-main, #222)" }}
              />
              {showDeleteBankDetails && (
                <>
                  <input
                    type="text"
                    placeholder="Bank account holder name"
                    value={bankAccountHolderName}
                    onChange={(event) => setBankAccountHolderName(event.target.value)}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-main, #c3c3c3)", background: "var(--input-background, #fff)", color: "var(--text-main, #222)" }}
                  />
                  <input
                    type="text"
                    placeholder="Bank name"
                    value={bankName}
                    onChange={(event) => setBankName(event.target.value)}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-main, #c3c3c3)", background: "var(--input-background, #fff)", color: "var(--text-main, #222)" }}
                  />
                  <input
                    type="text"
                    placeholder="IBAN"
                    value={bankIban}
                    onChange={(event) => setBankIban(event.target.value)}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-main, #c3c3c3)", background: "var(--input-background, #fff)", color: "var(--text-main, #222)" }}
                  />
                  <input
                    type="text"
                    placeholder="SWIFT code"
                    value={bankSwiftCode}
                    onChange={(event) => setBankSwiftCode(event.target.value)}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-main, #c3c3c3)", background: "var(--input-background, #fff)", color: "var(--text-main, #222)" }}
                  />
                </>
              )}
              <button
                type="submit"
                disabled={isDeletingAccount}
                style={{
                  background: isDeletingAccount ? "var(--button-disabled, #c3c3c3)" : "var(--error-main, #ff4d4d)",
                  border: "none",
                  color: "#fff",
                  cursor: isDeletingAccount ? "not-allowed" : "pointer",
                }}
              >
                {isDeletingAccount ? "Deleting..." : showDeleteBankDetails ? "Confirm and Delete" : "Continue"}
              </button>
              {deleteError && <p style={{ margin: 0, color: "var(--error-main, #ff8d8d)" }}>{deleteError}</p>}
            </form>
          </div>
          <button
            style={{
              marginTop: "15px",
              padding: "12px",
              borderRadius: "8px",
              background: "var(--error-main, #ff4d4d)",
              border: "none",
              cursor: "pointer",
              marginLeft: "10px",
              color: "#fff"
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* Account Options */}
        <div style={{ background: "var(--background-card, #f7f7fa)", padding: "20px", borderRadius: "12px", marginTop: "30px" }}>
          <h3>Account Options</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginTop: "15px" }}>
            <button>Security Settings</button>
            <button>Two-Factor Authentication</button>
            <button>Identity Verification (KYC)</button>
            <button>Device Management</button>
            <button>API Management</button>
            <button>Payment Methods</button>
            <button>Withdrawal Addresses</button>
            <button>Notifications</button>
            <button>Preferences</button>
            <button>Linked Accounts</button>
            <button>Referral Program</button>
          </div>

          <form onSubmit={handleChangePassword} style={{ marginTop: "20px", display: "grid", gap: "10px", maxWidth: "420px" }}>
            <h4 style={{ margin: 0 }}>Change Password</h4>
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-main, #c3c3c3)", background: "var(--input-background, #fff)", color: "var(--text-main, #222)" }}
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-main, #c3c3c3)", background: "var(--input-background, #fff)", color: "var(--text-main, #222)" }}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-main, #c3c3c3)", background: "var(--input-background, #fff)", color: "var(--text-main, #222)" }}
            />
            <button
              type="submit"
              disabled={isChangingPassword}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "none",
                background: isChangingPassword ? "var(--button-disabled, #c3c3c3)" : "var(--accent-main, #7f8cff)",
                color: "#fff",
                cursor: isChangingPassword ? "not-allowed" : "pointer",
              }}
            >
              {isChangingPassword ? "Changing..." : "Update Password"}
            </button>
            {passwordError && <p style={{ margin: 0, color: "var(--error-main, #ff8d8d)" }}>{passwordError}</p>}
            {passwordSuccess && <p style={{ margin: 0, color: "var(--success-main, #7cf29a)" }}>{passwordSuccess}</p>}
          </form>
        </div>

        {/* Settings Section */}
        {/* <div style={{ background: "#1a1d2e", padding: "20px", borderRadius: "12px", marginTop: "30px" }}>
          <h3>Account Settings</h3>
          <button
            style={{
              marginTop: "15px",
              padding: "12px",
              borderRadius: "8px",
              background: "#7f8cff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Edit Profile
          </button>
        </div> */}
      </div>

      {/* Right Sidebar */}
      {/* <aside
        style={{
          width: "300px",
          background: "#11131f",
          padding: "20px",
          borderLeft: "1px solid #222",
        }}
      >
        <h3>Profile Summary</h3>
        <h1 style={{ color: "#4dff88" }}>Active</h1>

        <div style={{ marginTop: "20px" }}>
          <p>Membership Level</p>
          <div style={{ background: "#1a1d2e", padding: "10px", borderRadius: "8px" }}>Premium</div>
          <p style={{ marginTop: "15px" }}>Last Login</p>
          <div style={{ background: "#1a1d2e", padding: "10px", borderRadius: "8px" }}>10 Dec 2025</div>
        </div>
      </aside> */}
    </div>
  );
}
