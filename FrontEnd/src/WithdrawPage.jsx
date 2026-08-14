import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";

export default function WithdrawPage() {
  const navigate = useNavigate();

  return (
    <div className="crypto-layout">
      <Sidebar />
      <main className="crypto-main">
        <header className="page-header">
          <h1>Withdraw</h1>
          <p>External cryptocurrency withdrawals are not implemented in this prototype.</p>
        </header>
        <section className="section-card">
          <h2>No withdrawal service connected</h2>
          <p>Your internal balances remain available on the wallet page. No blockchain transaction will be created here.</p>
          <div className="action-row">
            <button className="btn-primary" type="button" onClick={() => navigate("/wallets")}>View wallets</button>
            <button className="btn-ghost" type="button" onClick={() => navigate("/buy-sell")}>Open trading</button>
          </div>
        </section>
      </main>
    </div>
  );
}
