import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer" role="contentinfo">
      <div className="app-footer__top">
        <div className="app-footer__brand">
          <h4>Digital Market</h4>
          <p>A transparent paper-trading environment for learning how digital markets move.</p>
        </div>

        <nav className="app-footer__links" aria-label="Product navigation">
          <span>Product</span><Link to="/BitcoinChart">Markets</Link><Link to="/buy-sell">Trade</Link><Link to="/wallets">Wallets</Link>
        </nav>
        <nav className="app-footer__links" aria-label="Help navigation">
          <span>Resources</span><Link to="/education">Education</Link><Link to="/faq">Questions and answers</Link><Link to="/support">Support</Link>
        </nav>

      </div>

      <div className="app-footer__bottom">
        <span>© {year} Digital Market. Paper trading only.</span>
      </div>
    </footer>
  );
}
