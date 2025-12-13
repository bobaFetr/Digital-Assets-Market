import React from "react";
import BitcoinChart from "./BitcoinChart"; // ✅ Import your chart component

export default function App() {
  //const [open, setOpen] = useState(false); // ✅ dropdown state
  return (
    
    <div style={{ display: "flex", height: "100vh", background: "#0d0f1a", color: "#fff", fontFamily: "Arial" }}>
      {/* Sidebar */}
      <aside style={{ width: "220px", background: "#11131f", padding: "20px" }}>
        <h2 style={{ marginBottom: "20px" }}>CryptoMatrix</h2>
        <nav>
          {[
            "Crypto Currencies",
            "Businesses",
            "Pay",
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
        <h2>Good Morning, User</h2>

        {/* Recommended Coins */}
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          {[
            { name: "Ethereum", code: "ETH", rate: "+12.34%" },
            { name: "Bitcoin", code: "BTC", rate: "+12.34%" },
            { name: "Bitcoin Cash", code: "BTH", rate: "+11.34%" },
            { name: "Algorand", code: "ALGO", rate: "-12.34%" },
          ].map((coin) => (
            <div
              key={coin.code}
              style={{
                background: "#1a1d2e",
                padding: "20px",
                borderRadius: "12px",
                width: "200px",
              }}
            >
              <h4>
                {coin.name} ({coin.code})
              </h4>
              <p style={{ marginTop: "10px", color: "#7f8cff" }}>Reward Rate</p>
              <h3 style={{ marginTop: "5px", color: coin.rate.startsWith("-") ? "#ff4d4d" : "#4dff88" }}>
                {coin.rate}
              </h3>
            </div>
          ))}
        </div>

        {/* ✅ Bitcoin Live Chart Section */}
        <div style={{ background: "#1a1d2e", padding: "20px", borderRadius: "12px", marginTop: "30px" }}>
          <h3>Bitcoin Live Chart</h3>
          <BitcoinChart /> {/* Render the chart here */}
        </div>

        {/* Bitcoin Cash Graph Section */}
        <div style={{ background: "#1a1d2e", padding: "20px", borderRadius: "12px", marginTop: "30px" }}>
          <h3>Bitcoin Cash (BTH)</h3>
          <h1 style={{ color: "#4dff88" }}>$23.7475</h1>
          <div
            style={{ height: "280px", background: "#0d0f1a", marginTop: "20px", borderRadius: "10px" }}
          ></div>
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
        <h3>Total Balance</h3>
        <h1 style={{ color: "#4dff88" }}>$37.4343</h1>

        <div style={{ marginTop: "20px" }}>
          <p>You Sell</p>
          <div style={{ background: "#1a1d2e", padding: "10px", borderRadius: "8px" }}>BTC</div>
          <p style={{ marginTop: "15px" }}>You Get</p>
          <div style={{ background: "#1a1d2e", padding: "10px", borderRadius: "8px" }}>BTH</div>
          <button
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "12px",
              borderRadius: "8px",
              background: "#7f8cff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Exchange Now
          </button>
        </div>

        <div style={{ marginTop: "30px" }}>
          <h3>Market</h3>
          {[
            { code: "BTC", change: "+12.34%" },
            { code: "ACA", change: "-2.34%" },
            { code: "ALGO", change: "-12.34%" },
            { code: "BTH", change: "+12.34%" },
            { code: "BTL", change: "+12.34%" },
          ].map((m) => (
            <div
              key={m.code}
              style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}
            >
              <span>{m.code}</span>
              <span style={{ color: m.change.startsWith("-") ? "#ff4d4d" : "#4dff88" }}>{m.change}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}


