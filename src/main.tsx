
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import React from "react";
import { db } from "./database";
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import { Capacitor } from '@capacitor/core';
import { PowerSyncContext } from '@powersync/react';
import { Connector } from './database/PowerSyncConnector';
const renderApp = () => {
  createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      {/* Provide the PowerSync database context to all child components */}
      <PowerSyncContext.Provider value={db}>
        <App />
      </PowerSyncContext.Provider>
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

    db.init().then(() => {
      console.log("PowerSync Database initialized successfully!");
      db.connect(new Connector());
      renderApp();
    }).catch((err) => {
      console.error("Failed to initialize PowerSync Database:", err);
    });


  }).catch((err) => {
    console.error('Failed to load jeep-sqlite custom element', err);
  });

} else {
  // If native iOS/Android, skip the jeep-sqlite setup and render immediately
  db.init().then(() => {
    console.log("PowerSync Database initialized successfully!");
    db.connect(new Connector());
    renderApp();
  }).catch((err) => {
    console.error("Failed to initialize PowerSync Database:", err);
  });
  renderApp();
}

