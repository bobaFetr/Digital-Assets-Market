import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "./assets/Copilot_20251008_144326.png";
import profilePicture from "/Users/Lenovo/Desktop/Windows-10-user-icon-big.png";
export default function Profile() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0f1a", color: "#fff", fontFamily: "Arial" }}>
      {/* Sidebar */}
      <aside className="crypto-sidebar">
        {/* <h2 className="brand-title">Name</h2> */}
        <img src={logo} alt="Logo" style={{ width: "100%", maxWidth: "150px", marginBottom: "30px" }} />
        <nav className="nav-links">
          {["Pay", "Social", "More", "Stacking Calculator", "Profile Settings", "Crypto", "Sign Up", "Sign In"].map((item) => {
            if (item === "More") {
              return (
                <div key={item} className="nav-item-dropdown-container">
                  <div
                    className={`nav-item ${activeDropdown === "More" ? "active" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "More" ? null : "More")}
                  >
                    {item}
                  </div>
                  {activeDropdown === "More" && (
                    <div className="nav-dropdown-menu">
                      <div className="nav-dropdown-item">Tutorial for beginners</div>
                      <div className="nav-dropdown-item">Crypto Education</div>
                      <div className="nav-dropdown-item">Another Assets</div>
                      <div className="nav-dropdown-item">Favorites</div>
                      <div className="nav-dropdown-item">Trending</div>
                      <div className="nav-dropdown-item">Settings</div>
                      <div className="nav-dropdown-item">Help</div>
                    </div>
                  )}
                </div>
              );
            }
            if (item === "Crypto") {
              return (
                <div key={item} className="nav-item-dropdown-container">
                  <div
                    className={`nav-item ${activeDropdown === "Crypto" ? "active" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "Crypto" ? null : "Crypto")}
                  >
                    {item}
                  </div>
                  {activeDropdown === "Crypto" && (
                    <div className="nav-dropdown-menu">
                      <div className="nav-dropdown-item">AI Assistant</div>
                      <div className="nav-dropdown-item">Buy and Sell</div>
                      <div className="nav-dropdown-item">Deposit</div>
                      <Link to="/withdraw" className="nav-dropdown-item">Withdraw</Link>
                    </div>
                  )}
                </div>
              );
            }
            if (item === "Social") {
              return (
                <div key={item} className="nav-item-dropdown-container">
                  <div
                    className={`nav-item ${activeDropdown === "Social" ? "active" : ""}`}
                    onClick={() => setActiveDropdown(activeDropdown === "Social" ? null : "Social")}
                  >
                    {item}
                  </div>
                  {activeDropdown === "Social" && (
                    <div className="nav-dropdown-menu">
                      <div className="nav-dropdown-item">News</div>
                      <div className="nav-dropdown-item">Posts</div>
                      <div className="nav-dropdown-item">FAQ</div>
                      <Link to="/chat" className="nav-dropdown-item">Chat</Link>
                    </div>
                  )}
                </div>
              );
            }
            if (item === "Sign Up") {
              return (
                <Link to="/sign-up" className="nav-item nav-item-link" style={{ marginTop: "16px", color: "#7f8cff" }}>
                  Sign Up
                </Link>
              );
            }
            if (item === "Sign In") {
              return (
                <Link to="/sign-in" className="nav-dropdown-item">Sign In</Link>
              );
            }
            return (
              <div key={item} className="nav-item">
                {item}
              </div>
            );
          })}
          <Link to="/chat" className="nav-item nav-item-link" style={{ marginTop: "16px", color: "#7f8cff" }}>
            Chat
          </Link>
          <Link to="/profile" className="nav-item nav-item-link" style={{ marginTop: "16px", color: "#7f8cff" }}>
            Profile
          </Link>
        </nav>
      </aside>


      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <h2>Profile Page</h2>

        {/* User Info Section */}
        <div style={{ background: "#1a1d2e", padding: "20px", borderRadius: "12px", marginTop: "20px" }}>
          <div className="Profile_Picture">
            <img src={profilePicture} alt="Profile" style={{ width: "100px", borderRadius: "50%" }} />
          </div>
          <h3>User Information</h3>
          <p style={{ marginTop: "10px" }}>Name</p>
          <p>Email </p>
          <p>Account Balance</p>
          <p>Account ID</p>
          <p>Activity</p>
          <p>Favorites</p>
          <p>Change location</p>
          <p>Change email</p>
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
          >
            Logout
          </button>
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
