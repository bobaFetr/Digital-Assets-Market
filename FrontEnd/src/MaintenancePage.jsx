import "./App.css";
const pageStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "24px",
  background:
    "radial-gradient(circle at top left, rgba(127, 140, 255, 0.16), transparent 28%), radial-gradient(circle at 82% 14%, rgba(255, 127, 80, 0.12), transparent 24%), var(--bg-color)",
};

const sectionStyle = {
  width: "min(760px, 100%)",
  background: "linear-gradient(180deg, rgba(26, 29, 46, 0.96), rgba(17, 19, 31, 0.98))",
  border: "1px solid var(--glass-border)",
  borderRadius: "24px",
  padding: "40px 32px",
  boxShadow: "0 24px 60px rgba(0, 0, 0, 0.26)",
  textAlign: "center",
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "rgba(127, 140, 255, 0.12)",
  border: "1px solid rgba(127, 140, 255, 0.2)",
  color: "var(--text-secondary)",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
};

const dotStyle = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: "var(--brand-accent)",
  boxShadow: "0 0 16px rgba(255, 127, 80, 0.45)",
};

export default function MaintenancePage() {
  return (
    <div className="app-shell" style={pageStyle}>
      <section style={sectionStyle}>
        <img
          src="/assets/maintance.jpg"
          alt="Maintenance"
          style={{
            width: "100%",
            maxWidth: "420px",
            borderRadius: "18px",
            display: "block",
            margin: "0 auto 24px",
            boxShadow: "0 18px 40px rgba(0, 0, 0, 0.22)",
          }}
        />

        <div style={badgeStyle}>
          <span style={dotStyle} />
          Scheduled maintenance
        </div>

        <h1
          style={{
            margin: "18px 0 16px",
            fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
            lineHeight: 0.98,
            letterSpacing: "-0.04em",
            color: "var(--text-primary)",
          }}
        >
          CryptoMatrix is temporarily unavailable.
        </h1>

        <p
          style={{
            margin: "0 auto",
            maxWidth: "52ch",
            color: "#c9d0ff",
            lineHeight: 1.8,
            fontSize: "15px",
          }}
        >
          We are applying updates to improve platform stability, security, and account
          experience. Please check back shortly.
        </p>

        <div
          style={{
            marginTop: "24px",
            color: "var(--brand-accent-soft)",
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontWeight: 700,
          }}
        >
          Maintenance mode active
        </div>
      </section>
    </div>
  );
}
