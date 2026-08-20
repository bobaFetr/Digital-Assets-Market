import React, { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "crypto_cookie_consent_v1";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!window.localStorage.getItem(COOKIE_CONSENT_KEY));
  }, []);

  const handleChoice = choice => {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return <div className="cookie-popup" role="dialog" aria-live="polite" aria-label="Cookie policy">
    <div className="cookie-popup__content">
      <h3>Cookie Policy</h3>
      <p>We use cookies to keep your session secure, remember preferences, and improve platform performance.</p>
    </div>
    <div className="cookie-popup__actions">
      <button type="button" className="cookie-btn cookie-btn--secondary" onClick={() => handleChoice("declined")}>Decline</button>
      <button type="button" className="cookie-btn cookie-btn--primary" onClick={() => handleChoice("accepted")}>Accept</button>
    </div>
  </div>;
}
