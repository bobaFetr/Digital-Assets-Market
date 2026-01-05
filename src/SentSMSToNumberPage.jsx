import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

export default function SentSMSToNumberPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const sendSMS = () => {
    if (!phone.match(/^\+?[0-9]{6,15}$/)) {
      alert("Please enter a valid phone number with country code.");
      return;
    }
    alert(`SMS sent to ${phone}`);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!/^[0-9]{4,8}$/.test(code)) {
      alert("Enter the code you received by SMS.");
      return;
    }
    alert("Phone verified — thank you!");
  };

  return (
    <div className="login-shell">
      <section className="login-hero">
        <div className="hero-content">
          <h1>Verify your phone</h1>
          <p>We will send a verification code by SMS to the number you provide.</p>
          <ul>
            <li>Include country code (e.g., +1 ...)</li>
            <li>Codes expire in 5 minutes</li>
          </ul>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <h2>Phone verification</h2>
          {/* <p className="subtext">Enter your mobile number to receive a code</p> */}

          <form onSubmit={handleVerify} className="login-form">
            {/* <label>
              Phone number
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1234567890" />
            </label> */}

            {/* <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
              <button type="button" className="btn-primary" onClick={sendSMS}>Send SMS</button>
              <Link to="/sign-in" className="link-button">Use another method</Link>
            </div> */}

            <label>
              A verification code was sent to {phone || "<your phone number>"}.
              The code will expire in 5 minutes.
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
              <button type="submit" className="login-submit">Verify phone</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
