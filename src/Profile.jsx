import React from "react";

export default function Profile() {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0f1a", color: "#fff", fontFamily: "Arial" }}>
      {/* Sidebar */}
      <aside style={{ width: "220px", background: "#11131f", padding: "20px" }}>
        <h2 style={{ marginBottom: "20px" }}>CryptoMatrix</h2>
        <nav>
          {[
            "Dashboard",
            "Portfolio",
            "Asset",
            "Wallet",
            "More",
            "Data API",
            "Stacking Calculator",
            "Profile Settings",
          ].map((item) => (
            <div
              key={item}
              style={{ padding: "12px 0", opacity: 0.7, cursor: "pointer" }}
            >
              {item}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <h2>Profile Page</h2>

        {/* User Info Section */}
        <div style={{ background: "#1a1d2e", padding: "20px", borderRadius: "12px", marginTop: "20px" }}>
          <h3>User Information</h3>
          <p style={{ marginTop: "10px" }}>Name</p>
          <p>Email </p>
          <p>Account Balance</p>
          <p>Account ID</p>
          <p>Activity</p>
          <p>Favorites</p>
        </div>

        {/* Settings Section */}
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
      </aside>
    </div>
  );
}
