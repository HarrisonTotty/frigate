import React from "react";
import { createRoot } from "react-dom/client";
import "@frigate/ui/styles.css";
import App from "./App.tsx";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element with id 'root' not found");
}

autoSetupRender(container);

function autoSetupRender(element: HTMLElement) {
  const root = createRoot(element);
  root.render(<App />);
}
