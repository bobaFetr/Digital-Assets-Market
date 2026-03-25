import React from "react";
import Sidebar from "./Components/Sidebar";

export default function Profile() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d0f1a", color: "#fff", fontFamily: "Arial" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h2>Profile Page</h2>

        {/* User Info */}
        <div style={{ background: "#1a1d2e", padding: "20px", borderRadius: "12px", marginTop: "20px" }}>
          <h3>User Information</h3>
          <p style={{ marginTop: "10px" }}>Name: John Doe</p>
          <p>Email: johndoe@example.com</p>
          <p>Joined: January 2025</p>
        </div>

        {/* Account Settings */}
        <div style={{ background: "#1a1d2e", padding: "20px", borderRadius: "12px", marginTop: "30px" }}>
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
          >
            Logout
          </button>
        </div>

        {/* Activity */}
        <div style={{ background: "#1a1d2e", padding: "20px", borderRadius: "12px", marginTop: "30px" }}>
          <h3>Recent Activity</h3>
          <ul style={{ marginTop: "10px", paddingLeft: "18px", color: "#cbd5f5" }}>
            <li>Logged in from Chrome (Dec 10)</li>
            <li>Updated payout address (Dec 8)</li>
            <li>Completed KYC verification (Dec 2)</li>
          </ul>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside
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

        <div style={{ marginTop: "30px" }}>
          <h3>Security</h3>
          <div style={{ background: "#1a1d2e", padding: "10px", borderRadius: "8px", marginTop: "8px" }}>
            2FA: Enabled
          </div>
          <div style={{ background: "#1a1d2e", padding: "10px", borderRadius: "8px", marginTop: "8px" }}>
            Recovery Email: set
          </div>
        </div>
      </aside>
    </div>
  );
}
