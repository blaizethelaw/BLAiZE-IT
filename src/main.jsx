import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initLogoInteractive } from "./logo-interactive";

// Render the app
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ---- Safe, idempotent init for the interactive logo ----
(function setupLogoInit() {
  // Prevent double-inits (StrictMode, HMR, repeated imports)
  if (window.__logoInteractiveInit) return;
  window.__logoInteractiveInit = true;

  const runInit = () => {
    try {
      if (typeof initLogoInteractive === "function") {
        // Let React mount the DOM first, then init on next frame
        requestAnimationFrame(() => initLogoInteractive());
      }
    } catch (e) {
      console.error("initLogoInteractive failed:", e);
    }
  };

  if (document.readyState === "loading") {
    const onReady = () => {
      document.removeEventListener("DOMContentLoaded", onReady);
      runInit();
    };
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    runInit();
  }
})();
