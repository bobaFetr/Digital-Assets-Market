import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, getToken, logoutUser, updateProfilePicture } from "./Services/auth";
import Sidebar from "./Components/Sidebar";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5149";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [balanceError, setBalanceError] = useState("");
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const data = await getProfile();
        if (isMounted) {
          setProfile(data);
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

    const loadBalance = async () => {
      const token = getToken();
      if (!token) {
        if (isMounted) {
          setBalance(null);
          setBalanceError("Not authenticated.");
          setIsBalanceLoading(false);
        }
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

        if (isMounted) {
          setBalance(total);
          setBalanceError("");
        }
      } catch (err) {
        if (isMounted) {
          setBalance(null);
          setBalanceError(err.message || "Unable to load balance.");
        }
      } finally {
        if (isMounted) {
          setIsBalanceLoading(false);
        }
      }
    };

    loadProfile();
    loadBalance();
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

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0f1a", color: "#fff", fontFamily: "Arial" }}>
      {/* Sidebar */}
      <Sidebar />


      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <h2>Profile Page</h2>

        {/* User Info Section */}
        <div style={{ background: "#1a1d2e", padding: "20px", borderRadius: "12px", marginTop: "20px" }}>
          <div
            className="Profile_Picture"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "#2a2f4a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "bold",
              color: "#7f8cff",
              overflow: "hidden",
            }}
          >
            {profile?.profilePictureUrl ? (
              <img
                src={profile.profilePictureUrl}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              (profile?.email || "U").slice(0, 1).toUpperCase()
            )}
          </div>
          <div style={{ marginTop: "12px" }}>
            <label
              style={{
                display: "inline-block",
                padding: "10px 14px",
                borderRadius: "8px",
                background: isUploadingPicture ? "#3e4162" : "#7f8cff",
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
            {uploadError && <p style={{ marginTop: "8px", color: "#ff8d8d" }}>{uploadError}</p>}
          </div>
          <h3>User Information</h3>
          {isLoading && <p style={{ marginTop: "10px" }}>Loading profile...</p>}
          {error && <p style={{ marginTop: "10px", color: "#ff8d8d" }}>{error}</p>}
          {!isLoading && !error && (
            <>
              <p style={{ marginTop: "10px" }}>Email: {profile?.email}</p>
              <p>Role: {profile?.role}</p>
              {isBalanceLoading && <p>Balance: Loading...</p>}
              {!isBalanceLoading && balanceError && <p style={{ color: "#ff8d8d" }}>Balance: unavailable</p>}
              {!isBalanceLoading && !balanceError && <p>Balance: ${formattedBalance}</p>}
            </>
          )}
          <div className="TransactionHistory">
            <button>Transaction History</button>
          </div>
          <div>
            <button>Download all your account info</button>
          </div>
          <div className="DeleteAcccountButton">
            <button>Delete Account</button>
          </div>
          <button
            style={{
              marginTop: "15px",
              padding: "12px",
              borderRadius: "8px",
              background: "#ff4d4d",
              border: "none",
              cursor: "pointer",
              marginLeft: "10px",
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* Account Options */}
        <div style={{ background: "#1a1d2e", padding: "20px", borderRadius: "12px", marginTop: "30px" }}>
          <h3>Account Options</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginTop: "15px" }}>
            <button>Security Settings</button>
            <button>Two-Factor Authentication</button>
            <button>Change Password</button>
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
