import React from "react";
import Sidebar from "./Components/Sidebar";
export default function HowToSecureWallet() {
  return <div className="crypto-layout">
      <Sidebar />
      <div className="crypto-main">
        <h1>How to Secure Your Wallet</h1>
        <p>
          Practical steps to keep your crypto wallet and funds safe.
        </p>

        <div>
          <h3>1. Protect your seed phrase</h3>
          <p>
            Write your recovery phrase offline and store it in a secure place. Never share it with anyone.
          </p>

          <h3>2. Enable strong authentication</h3>
          <p>
            Use a strong unique password and enable 2FA on your exchange and related email accounts.
          </p>

          <h3>3. Verify addresses before sending</h3>
          <p>
            Double-check wallet addresses and network types. Send a small test transfer first.
          </p>

          <h3>4. Watch for phishing and scams</h3>
          <p>
            Avoid unknown links, fake support contacts, and urgent account-issue messages.
          </p>
        </div>
      </div>
    </div>;
}
