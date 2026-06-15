# Step 1: Dependencies and Cleanup

This first phase focuses on preparing the project environment by removing obsolete SQLite implementations and installing the official PowerSync libraries.

## 1. Remove Old Dependencies
We need to strip out the previous `jeep-sqlite` implementation, as this was the root cause of the WASM/MIME errors you were experiencing on the Web platform.
*   **Remove:** `jeep-sqlite` from `package.json`.
*   **Remove:** Any initialization code in `src/main.tsx` or `index.html` that manually bootstraps `jeep-sqlite` custom elements (`defineCustomElements(window)`).

## 2. Install PowerSync Packages
PowerSync uses a modular package architecture. We will install the following:
*   `@powersync/capacitor`: The core bridge that allows PowerSync to communicate with the native device's SQLite engine.
*   `@powersync/web`: Provides the fallback for Web platforms so the app runs seamlessly in the browser.
*   `@journeyapps/wa-sqlite`: The WebAssembly SQLite engine used exclusively by `@powersync/web`.
*   `@powersync/react`: Provides the reactive hooks (like `useQuery`) that automatically re-render components on data changes.

## 3. Capacitor Sync
After installing the dependencies, we must synchronize the Capacitor iOS/Android projects to ensure the native plugins are linked correctly.
*   **Command:** `npx cap sync`

## Verification
*   Run `npm run dev` to confirm the project builds successfully without any missing dependency errors.
*   Check the browser console to ensure the old `jeep-sqlite` WASM errors are completely gone.
