import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer" role="contentinfo">
      <div className="app-footer__top">
        <div className="app-footer__brand">
          <h4>CryptoMatrix</h4>
          <p>Secure crypto trading, wallet management, and account protection tools.</p>
        </div>

        <nav className="app-footer__links" aria-label="Footer navigation">
          <Link to="/faq">Questions and Answers</Link>
          <Link to="/support">Support</Link>
          <Link to="/feedback">Feedback</Link>
        </nav>

        <div className="app-footer__socials" aria-label="Social links">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link" aria-label="Instagram">
            <span className="social-icon" aria-hidden="true">📸</span>
            <span>Instagram</span>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-link" aria-label="Facebook">
            <span className="social-icon" aria-hidden="true">📘</span>
            <span>Facebook</span>
          </a>
          <a href="https://x.com" target="_blank" rel="noreferrer" className="social-link" aria-label="X (Twitter)">
            <span className="social-icon" aria-hidden="true">🐦</span>
            <span>X</span>
          </a>
        </div>
      </div>

      <div className="app-footer__bottom">
        <span>© {year} CryptoMatrix. All rights reserved.</span>
      </div>
    </footer>
  );
}