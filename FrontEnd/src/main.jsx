import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import "./design-system.css";
import MaintenancePage from "./MaintenancePage.jsx";
import { isMaintenanceModeEnabled } from "./config/runtimeConfig.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {isMaintenanceModeEnabled() ? (
      <MaintenancePage />
    ) : (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )}
  </StrictMode>
);
