import React from "react";
import { Routes, Route, Link } from "react-router-dom";

/* ===== Pages ===== */
const Dashboard = () => <h2>Dashboard</h2>;
const Assets = () => <h2>Assets</h2>;
const Transactions = () => <h2>Transactions</h2>;
const Users = () => <h2>Users</h2>;
const Settings = () => <h2>Settings</h2>;

/* ===== Sidebar ===== */
function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <h2 style={styles.logo}>Admin Panel</h2>
      <Link style={styles.link} to="/Admin">Dashboard</Link>
      <Link style={styles.link} to="/Admin/assets">Assets</Link>
      <Link style={styles.link} to="/Admin/transactions">Transactions</Link>
      <Link style={styles.link} to="/Admin/users">Users</Link>
      <Link style={styles.link} to="/Admin/settings">Settings</Link>
      <button>Manage news</button>
      <button>Manage Announcements</button>
      <button>Manage Announcements</button>
    </aside>
  );
}

/* ===== Admin Layout ===== */
export default function Admin() {
  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.content}>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<Assets />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

/* ===== Styles ===== */
const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    background: "#0d0f1a",
    color: "white",
  },
  sidebar: {
    width: "240px",
    background: "#11131f",
    padding: "20px",
  },
  logo: {
    marginBottom: "20px",
    color: "#7f8cff",
  },
  link: {
    display: "block",
    marginBottom: "12px",
    color: "#9aa4ff",
    textDecoration: "none",
  },
  content: {
    flex: 1,
    padding: "30px",
  },
};
