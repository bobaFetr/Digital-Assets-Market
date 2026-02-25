import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const COOKIE_CONSENT_KEY = "crypto_cookie_consent_v1";
const COOKIE_CONSENT_TRIGGER_KEY = "crypto_cookie_consent_trigger_v1";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const shouldPromptAfterRegister = window.localStorage.getItem(COOKIE_CONSENT_TRIGGER_KEY) === "true";

    if (shouldPromptAfterRegister) {
      setIsVisible(true);
      return;
    }

    const existingValue = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!existingValue) {
      setIsVisible(false);
      return;
    }

    setIsVisible(false);
  }, [location.pathname]);

  const handleChoice = (choice) => {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    window.localStorage.removeItem(COOKIE_CONSENT_TRIGGER_KEY);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="cookie-popup" role="dialog" aria-live="polite" aria-label="Cookie policy">
      <div className="cookie-popup__content">
        <h3>Cookie Policy</h3>
        <p>
          We use cookies to keep your session secure, remember preferences, and improve platform performance.
        </p>
      </div>

      <div className="cookie-popup__actions">
        <button type="button" className="cookie-btn cookie-btn--secondary" onClick={() => handleChoice("declined")}>
          Decline
        </button>
        <button type="button" className="cookie-btn cookie-btn--primary" onClick={() => handleChoice("accepted")}>
          Accept
        </button>
      </div>
    </div>
  );
}