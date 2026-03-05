import React from "react";
import { useNavigate } from "react-router-dom";

export default function ErorPage1() {
  //export default function ErorPage1() {
    const navigate = useNavigate();

    return (
      <div className="error-page error-page-1">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=IBM+Plex+Serif:wght@400;600&display=swap');
          .error-page-1 {
            min-height: 100vh;
            background: radial-gradient(1200px 600px at 15% 20%, rgba(41, 74, 255, 0.22), transparent 60%),
                        radial-gradient(900px 500px at 80% 10%, rgba(255, 176, 36, 0.20), transparent 55%),
                        linear-gradient(160deg, #0b0f1a, #0b1229 60%, #0f1a33);
            color: #f3f6ff;
            display: grid;
            place-items: center;
            padding: 48px 24px;
            font-family: 'Space Grotesk', sans-serif;
          }
          .error-card {
            width: min(980px, 100%);
            display: grid;
            gap: 24px;
            padding: 40px;
            background: rgba(13, 18, 34, 0.88);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            box-shadow: 0 30px 80px rgba(8, 12, 24, 0.65);
            position: relative;
            overflow: hidden;
          }
          .error-card::after {
            content: '';
            position: absolute;
            inset: -30% 50% 40% -20%;
            background: linear-gradient(120deg, rgba(77, 113, 255, 0.35), rgba(10, 16, 34, 0));
            transform: rotate(-6deg);
            pointer-events: none;
          }
          .error-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 24px;
          }
          .error-code {
            font-size: clamp(64px, 12vw, 128px);
            font-weight: 700;
            letter-spacing: -4px;
            color: #7f8cff;
            line-height: 1;
          }
          .error-title {
            font-family: 'IBM Plex Serif', serif;
            font-size: clamp(26px, 3vw, 38px);
            margin: 0 0 8px 0;
          }
          .error-copy {
            max-width: 560px;
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
            margin: 0;
          }
          .error-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 14px;
            margin-top: 12px;
          }
          .btn-primary,
          .btn-ghost {
            border-radius: 999px;
            padding: 12px 20px;
            font-weight: 600;
            border: none;
            cursor: pointer;
          }
          .btn-primary {
            background: #7f8cff;
            color: #0b0f1a;
          }
          .btn-ghost {
            background: transparent;
            color: #f3f6ff;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .status-strip {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            font-size: 14px;
          }
          .status-item {
            background: rgba(255, 255, 255, 0.08);
            padding: 10px 14px;
            border-radius: 12px;
            color: rgba(255, 255, 255, 0.75);
          }
        `}</style>
        <section className="error-card">
          <div className="error-header">
            <div>
              <div className="error-code">404</div>
              <h1 className="error-title">Lost in the order book</h1>
              <p className="error-copy">
                The page you requested is not here. It may have moved, been delisted, or never existed.
              </p>
            </div>
          </div>
          <div className="error-actions">
            <button className="btn-primary" type="button" onClick={() => navigate("/")}>Return to dashboard</button>
            <button className="btn-ghost" type="button">Search markets</button>
          </div>
          <div className="status-strip">
            <div className="status-item">Network: DAM Prime</div>
            <div className="status-item">Status: Stable</div>
            <div className="status-item">Last sync: 2 min ago</div>
          </div>
        </section>
      </div>
    );
  
}
