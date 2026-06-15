
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import { Capacitor } from '@capacitor/core';
import React from "react";

// Abstract the render method so we can call it conditionally
const renderApp = () => {
  createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Check if running in the browser
if (Capacitor.getPlatform() === 'web') {
  // 1. Register the custom element
  jeepSqlite(window);

  // 2. Create the element and attach it to the DOM immediately
  const jeepEl = document.createElement('jeep-sqlite');
  document.body.appendChild(jeepEl);

  // 3. Pause React until the browser fully registers the custom element
  customElements.whenDefined('jeep-sqlite').then(() => {
    renderApp();
  }).catch((err) => {
    console.error('Failed to load jeep-sqlite custom element', err);
  });
} else {
  // If native iOS/Android, skip the jeep-sqlite setup and render immediately
  renderApp();
}
