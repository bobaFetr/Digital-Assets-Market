import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, logoutUser } from "./Services/auth";
import Sidebar from "./Components/Sidebar";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/sign-in");
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
            }}
          >
            {(profile?.email || "U").slice(0, 1).toUpperCase()}
          </div>
          <h3>User Information</h3>
          {isLoading && <p style={{ marginTop: "10px" }}>Loading profile...</p>}
          {error && <p style={{ marginTop: "10px", color: "#ff8d8d" }}>{error}</p>}
          {!isLoading && !error && (
            <>
              <p style={{ marginTop: "10px" }}>Email: {profile?.email}</p>
              <p>Role: {profile?.role}</p>
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
