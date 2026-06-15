# Step 3: Application Integration

This phase integrates the initialized PowerSync database into your React application tree and configures the build tooling.

## 1. Provide the Database Context (`src/main.tsx` / `src/App.tsx`)
To allow any component in your app to use PowerSync's reactive hooks, we must wrap the application tree in the `PowerSyncContext.Provider`.

```tsx
import { PowerSyncContext } from '@powersync/react';
import { db } from './database';

// Wait for DB initialization before rendering the app
await db.init();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PowerSyncContext.Provider value={db}>
      <App />
    </PowerSyncContext.Provider>
  </React.StrictMode>,
);
```

## 2. Configure Vite for Web SQLite (`vite.config.ts`)
Because PowerSync relies on `@journeyapps/wa-sqlite` for Web support, Vite needs to correctly serve the associated WebAssembly (`.wasm`) files. 
Depending on your exact Vite setup, we may need to use `vite-plugin-static-copy` or adjust the `optimizeDeps` array to ensure the WASM assets are bundled and accessible in the browser.

```typescript
// Example snippet for Vite configuration
optimizeDeps: {
  exclude: ['@journeyapps/wa-sqlite']
}
```

## Verification
*   Load the Web app.
*   Ensure that there are no 404 errors in the network tab relating to `.wasm` files.
*   Ensure the React application renders completely without throwing context-related errors.
