import React from "react";
import { createRoot } from "react-dom/client";
import "@frigate/ui/styles.css";
import App from "./App.tsx";
import { initLogBridge } from "./logBridge";

// Initialize JS→Rust logging bridge early
// This forwards console.log/warn/error to Rust's logger
initLogBridge();

const appRoot = document.getElementById("root");

if (!appRoot) {
  throw new Error("Tauri WebView root element missing");
}

const root = createRoot(appRoot);
root.render(<App />);
