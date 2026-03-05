import React from "react";

export default function ErrorPage2() {
  return (
    <div className="error-page error-page-2">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700&family=Fraunces:wght@600;700&display=swap');
        .error-page-2 {
          min-height: 100vh;
          background: linear-gradient(180deg, #0e0c16 0%, #1b0f1c 55%, #24121f 100%);
          color: #fff4f0;
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          place-items: center;
          padding: 56px 24px;
          font-family: 'Archivo', sans-serif;
        }
        .error-grid {
          width: min(1100px, 100%);
          display: grid;
          gap: 32px;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          align-items: center;
        }
        .error-badge {
          background: rgba(255, 113, 86, 0.12);
          border: 1px solid rgba(255, 113, 86, 0.4);
          color: #ff7156;
          padding: 10px 16px;
          border-radius: 999px;
          display: inline-flex;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-size: 12px;
        }
        .error-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(28px, 3vw, 44px);
          margin: 16px 0 12px 0;
        }
        .error-copy {
          color: rgba(255, 244, 240, 0.7);
          line-height: 1.7;
          margin: 0 0 20px 0;
        }
        .error-panel {
          background: rgba(28, 18, 28, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
        }
        .pulse-ring {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 2px dashed rgba(255, 113, 86, 0.5);
          display: grid;
          place-items: center;
          margin: 0 auto;
          position: relative;
          animation: spin 16s linear infinite;
        }
        .pulse-ring::after {
          content: '503';
          font-size: 42px;
          font-weight: 700;
          color: #ff7156;
          animation: pulse 2s ease-in-out infinite;
        }
        .error-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 20px;
        }
        .btn-primary {
          background: #ff7156;
          color: #2b0f15;
          border: none;
          border-radius: 12px;
          padding: 12px 18px;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-ghost {
          background: transparent;
          color: #fff4f0;
          border: 1px solid rgba(255, 244, 240, 0.4);
          border-radius: 12px;
          padding: 12px 18px;
          cursor: pointer;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.7; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="error-grid">
        <div>
          <span className="error-badge">Service Offline</span>
          <h1 className="error-title">Liquidity engine is paused</h1>
          <p className="error-copy">
            The service is temporarily unavailable while we rebalance systems. Your assets are safe and the
            market is syncing.
          </p>
          <div className="error-actions">
            <button className="btn-primary" type="button">Check status</button>
            <button className="btn-ghost" type="button">Notify me</button>
          </div>
        </div>
        <div className="error-panel">
          <div className="pulse-ring" />
          <p style={{ textAlign: "center", marginTop: "16px", color: "rgba(255, 244, 240, 0.65)" }}>
            Estimated recovery: 18 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
