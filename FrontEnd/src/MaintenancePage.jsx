import "./App.css";
import logo from "./assets/Gemini_Generated_Image_sb5zszsb5zszsb5z.png";

const shellStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const topBarButtonStyle = {
  background: "var(--card-bg)",
  border: "1px solid var(--glass-border)",
  color: "var(--text-primary)",
  padding: "12px 16px",
  borderRadius: "12px",
  minHeight: "48px",
  display: "inline-flex",
  alignItems: "center",
  fontWeight: 600,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
};

const activeNavStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  background: "#ff7f50",
  color: "#fff",
  border: "none",
  borderRadius: "999px",
  fontWeight: 700,
  fontSize: "16px",
  padding: "10px 22px",
  margin: "2px 0",
  boxShadow: "0 2px 8px #ff7f50a0",
};

const mutedNavStyle = {
  ...activeNavStyle,
  background: "transparent",
  color: "var(--text-secondary)",
  fontWeight: 500,
  boxShadow: "none",
};

const chartContainerStyle = {
  background: "linear-gradient(180deg, rgba(26, 29, 46, 0.94), rgba(17, 19, 31, 0.98))",
  padding: "24px",
  borderRadius: "16px",
  marginBottom: "30px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  border: "1px solid var(--glass-border)",
};

const coinCardStyle = {
  background: "var(--card-bg)",
  padding: "24px",
  borderRadius: "16px",
  border: "1px solid transparent",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
};

const accentCardStyle = {
  ...coinCardStyle,
  background: "linear-gradient(135deg, var(--brand-accent) 0%, var(--brand-accent-strong) 100%)",
  color: "#fff",
  boxShadow: "0 4px 16px rgba(255, 127, 80, 0.35)",
};

const metricValueStyle = {
  color: "var(--text-primary)",
  fontSize: "24px",
  fontWeight: 700,
  marginTop: "10px",
};

const metricNoteStyle = {
  marginTop: "10px",
  color: "#c9d0ff",
  fontSize: "13px",
  lineHeight: 1.6,
};

const statusItemStyle = {
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid var(--glass-border)",
  background: "var(--surface-muted)",
};

const timelineRowStyle = {
  display: "grid",
  gridTemplateColumns: "130px 1fr",
  gap: "14px",
  alignItems: "start",
  padding: "14px 16px",
  borderRadius: "14px",
  background: "rgba(255, 255, 255, 0.02)",
  border: "1px solid var(--glass-border)",
};

export default function MaintenancePage() {
  const year = new Date().getFullYear();

  return (
    <div className="app-shell" style={shellStyle}>
      <div className="app-shell-content">
        <div className="crypto-layout">
          <aside className="crypto-sidebar" aria-label="Maintenance navigation">
            <div className="sidebar-brand-row">
              <a className="sidebar-brand" href="/" aria-label="CryptoMatrix home">
                <img className="sidebar-brand-image" src={logo} alt="CryptoMatrix logo" />
              </a>
            </div>

            <nav className="nav-links">
              <div style={activeNavStyle}>
                <span>[x]</span>
                <span>Maintenance</span>
              </div>
              <div style={mutedNavStyle}>
                <span>[ ]</span>
                <span>Dashboard</span>
              </div>
              <div style={mutedNavStyle}>
                <span>[ ]</span>
                <span>Markets</span>
              </div>
              <div style={mutedNavStyle}>
                <span>[ ]</span>
                <span>Wallets</span>
              </div>
              <div style={mutedNavStyle}>
                <span>[ ]</span>
                <span>Support</span>
              </div>
            </nav>
          </aside>

          <main className="crypto-main">
            <div className="top-bar">
              <div className="top-bar-main">
                <div className="search-container" aria-hidden="true">
                  <span className="search-icon">::</span>
                  <span className="top-search-input" style={{ color: "var(--input-placeholder)" }}>
                    Search assets, markets, or news...
                  </span>
                </div>
              </div>

              <div className="top-bar-actions">
                <div style={topBarButtonStyle}>Maintenance Window</div>
                <div
                  className="top-profile"
                  aria-label="Platform status"
                  style={{
                    background: "linear-gradient(135deg, var(--brand-accent), var(--brand-accent-strong))",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    fontWeight: 800,
                  }}
                >
                  CI
                </div>
              </div>
            </div>

            <section
              style={{
                ...chartContainerStyle,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
                alignItems: "stretch",
              }}
            >
              <div>
                <div
                  style={{
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
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: "var(--brand-accent)",
                      boxShadow: "0 0 16px rgba(255, 127, 80, 0.5)",
                    }}
                  />
                  Scheduled platform update
                </div>

                <h1
                  style={{
                    margin: "10px 0 16px",
                    fontSize: "clamp(2.4rem, 5vw, 4rem)",
                    lineHeight: 0.95,
                    letterSpacing: "-0.04em",
                    color: "var(--text-primary)",
                  }}
                >
                  CryptoMatrix is temporarily offline for maintenance.
                </h1>

                <p
                  style={{
                    margin: 0,
                    maxWidth: "58ch",
                    color: "#c9d0ff",
                    lineHeight: 1.8,
                    fontSize: "15px",
                  }}
                >
                  We are applying updates to improve platform stability, security, and account
                  experience. The dashboard and API are paused for a short time, and service will
                  return as soon as the work is complete.
                </p>
              </div>

              <div style={{ display: "grid", gap: "14px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    borderRadius: "999px",
                    background: "rgba(77, 255, 136, 0.12)",
                    color: "var(--success-main)",
                    fontSize: "13px",
                    fontWeight: 700,
                    width: "fit-content",
                  }}
                >
                  System status: planned maintenance
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  <div style={statusItemStyle}>
                    <span
                      style={{
                        display: "block",
                        color: "var(--text-secondary)",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: "8px",
                      }}
                    >
                      Availability
                    </span>
                    <strong style={{ color: "var(--text-primary)", lineHeight: 1.5 }}>
                      Public pages and authenticated tools are temporarily unavailable.
                    </strong>
                  </div>

                  <div style={statusItemStyle}>
                    <span
                      style={{
                        display: "block",
                        color: "var(--text-secondary)",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: "8px",
                      }}
                    >
                      API state
                    </span>
                    <strong style={{ color: "var(--text-primary)", lineHeight: 1.5 }}>
                      Requests return a temporary unavailable response while maintenance mode is enabled.
                    </strong>
                  </div>

                  <div style={statusItemStyle}>
                    <span
                      style={{
                        display: "block",
                        color: "var(--text-secondary)",
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: "8px",
                      }}
                    >
                      Restore
                    </span>
                    <strong style={{ color: "var(--text-primary)", lineHeight: 1.5 }}>
                      Turn off the frontend Render maintenance variable to bring the site back online.
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="cards-grid">
              <article style={accentCardStyle}>
                <div className="coin-header">
                  <h4 style={{ color: "#fff" }}>Platform status</h4>
                </div>
                <div className="balance-amount" style={{ color: "#fff" }}>
                  Paused
                </div>
                <div className="reward-label" style={{ color: "var(--brand-accent-soft)" }}>
                  maintenance mode active
                </div>
                <p style={{ marginTop: "12px", color: "rgba(255, 255, 255, 0.78)", lineHeight: 1.7, fontSize: "14px" }}>
                  The frontend is intentionally showing this maintenance screen instead of the normal app.
                </p>
              </article>

              <article style={coinCardStyle}>
                <div className="coin-header">
                  <h4>User impact</h4>
                </div>
                <div style={metricValueStyle}>Full-site hold</div>
                <p style={metricNoteStyle}>
                  Visitors see this page first, so the site never reaches the dashboard while the flag is enabled.
                </p>
              </article>

              <article style={coinCardStyle}>
                <div className="coin-header">
                  <h4>Render switch</h4>
                </div>
                <div style={metricValueStyle}>MAINTENANCE_MODE=true</div>
                <p style={metricNoteStyle}>
                  Set the same flag on the frontend service to show this page, and on the backend service to block APIs.
                </p>
              </article>
            </section>

            <section style={chartContainerStyle}>
              <div className="chart-header">Maintenance details</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                <article style={coinCardStyle}>
                  <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "8px" }}>
                    Frontend service
                  </div>
                  <div style={metricValueStyle}>Shows this page</div>
                  <p style={metricNoteStyle}>
                    Use `MAINTENANCE_MODE=true` on the frontend Render service so users see maintenance immediately.
                  </p>
                </article>

                <article style={coinCardStyle}>
                  <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "8px" }}>
                    Backend service
                  </div>
                  <div style={metricValueStyle}>Returns 503</div>
                  <p style={metricNoteStyle}>
                    Keep the backend maintenance flag on too, so API calls are blocked while the site is paused.
                  </p>
                </article>

                <article style={coinCardStyle}>
                  <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "8px" }}>
                    Disable maintenance
                  </div>
                  <div style={metricValueStyle}>Set false</div>
                  <p style={metricNoteStyle}>
                    Change the frontend env var to `false` or remove it, then let Render restart the service.
                  </p>
                </article>
              </div>
            </section>

            <section style={chartContainerStyle}>
              <div className="chart-header">What happens now</div>
              <div style={{ display: "grid", gap: "12px" }}>
                <div style={timelineRowStyle}>
                  <strong style={{ color: "var(--brand-accent)", fontSize: "13px", textTransform: "uppercase" }}>
                    Step 1
                  </strong>
                  <div style={{ color: "#e2e8ff", lineHeight: 1.6, fontSize: "14px" }}>
                    The frontend container writes `runtime-config.js` from the Render environment at startup.
                  </div>
                </div>
                <div style={timelineRowStyle}>
                  <strong style={{ color: "var(--brand-accent)", fontSize: "13px", textTransform: "uppercase" }}>
                    Step 2
                  </strong>
                  <div style={{ color: "#e2e8ff", lineHeight: 1.6, fontSize: "14px" }}>
                    React reads the maintenance flag before the app loads and renders this screen instead.
                  </div>
                </div>
                <div style={timelineRowStyle}>
                  <strong style={{ color: "var(--brand-accent)", fontSize: "13px", textTransform: "uppercase" }}>
                    Step 3
                  </strong>
                  <div style={{ color: "#e2e8ff", lineHeight: 1.6, fontSize: "14px" }}>
                    When the flag is removed, the normal frontend app boots again on the next deploy or restart.
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      <footer className="app-footer" role="contentinfo">
        <div className="app-footer__top">
          <div className="app-footer__brand">
            <h4>CryptoMatrix</h4>
            <p>Secure crypto trading, wallet management, and account protection tools.</p>
          </div>

          <nav className="app-footer__links" aria-label="Footer links">
            <a href="/faq">Questions and Answers</a>
            <a href="/support">Support</a>
            <a href="/feedback">Feedback</a>
          </nav>

          <div className="app-footer__socials" aria-label="Social links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-link">
              Facebook
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" className="social-link">
              X
            </a>
          </div>
        </div>

        <div className="app-footer__bottom">
          <span>&copy; {year} CryptoMatrix. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
