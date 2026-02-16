import React from "react";

export default function ErrorPage3() {
  return (
    <div className="error-page error-page-3">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=PT+Serif:wght@400;700&display=swap');
        .error-page-3 {
          min-height: 100vh;
          background: linear-gradient(140deg, #0b121a, #081c24 55%, #04202b);
          color: #e9fbff;
          display: grid;
          place-items: center;
          padding: 56px 24px;
          font-family: 'Outfit', sans-serif;
        }
        .error-shell {
          width: min(1000px, 100%);
          display: grid;
          gap: 24px;
          border-radius: 28px;
          padding: 36px;
          background: rgba(7, 16, 22, 0.9);
          border: 1px solid rgba(125, 244, 255, 0.14);
          position: relative;
          overflow: hidden;
        }
        .error-shell::before {
          content: '';
          position: absolute;
          inset: 12% -40% auto auto;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(89, 255, 214, 0.35), transparent 65%);
          filter: blur(4px);
        }
        .error-kicker {
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 12px;
          color: rgba(125, 244, 255, 0.8);
        }
        .error-title {
          font-family: 'PT Serif', serif;
          font-size: clamp(30px, 3vw, 44px);
          margin: 6px 0 12px 0;
        }
        .error-copy {
          color: rgba(233, 251, 255, 0.7);
          line-height: 1.7;
          margin: 0;
        }
        .error-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }
        .metric-card {
          background: rgba(8, 25, 32, 0.7);
          border: 1px solid rgba(125, 244, 255, 0.12);
          border-radius: 16px;
          padding: 16px;
        }
        .metric-label {
          font-size: 12px;
          color: rgba(233, 251, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .metric-value {
          font-size: 22px;
          font-weight: 600;
          margin-top: 6px;
        }
        .error-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 18px;
        }
        .btn-primary {
          background: #59ffd6;
          color: #04202b;
          border: none;
          border-radius: 12px;
          padding: 12px 18px;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-ghost {
          background: transparent;
          color: #e9fbff;
          border: 1px solid rgba(125, 244, 255, 0.35);
          border-radius: 12px;
          padding: 12px 18px;
          cursor: pointer;
        }
      `}</style>
      <section className="error-shell">
        <div>
          <div className="error-kicker">Access blocked</div>
          <h1 className="error-title">401 - Session expired</h1>
          <p className="error-copy">
            Your secure session ended. Sign in again to keep monitoring your portfolio and active orders.
          </p>
        </div>
        <div className="error-metrics">
          <div className="metric-card">
            <div className="metric-label">Session uptime</div>
            <div className="metric-value">3h 48m</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Alerts queued</div>
            <div className="metric-value">12</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Sync status</div>
            <div className="metric-value">Paused</div>
          </div>
        </div>
        <div className="error-actions">
          <button className="btn-primary" type="button">Sign in again</button>
          <button className="btn-ghost" type="button">Contact support</button>
        </div>
      </section>
    </div>
  );
}
