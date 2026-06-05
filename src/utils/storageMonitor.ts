/**
 * This module monitors the user's storage usage and provides information about storage quota
 * 
 * Key Functions
 * - checkStorageQuota: Checks current storage usage against the limit
 * - migrateFromLocalStorage: Migrates data from local storage to indexedDB (for backward compatibility)
 * 
 * Important Note: Storage quota is limited to 150MB for this application to ensure 
 * proper functionality and prevent data loss
 */
const LIMIT_150MB = 150 * 1024 * 1024;

export interface StorageStatus {
  currentSize: number;
  limit: number;
  exceeded: boolean;
}

export const checkStorageQuota = async (): Promise<StorageStatus> => {
  let currentSize = 0;
  const limit = LIMIT_150MB;

  if (navigator.storage && navigator.storage.estimate) {
    try {

      const estimate = await navigator.storage.estimate();
      currentSize = estimate.usage || 0;
    } catch (e) {
      console.error("Storage estimation failed", e);
    }
  }

  return {
    currentSize,
    limit,
    exceeded: currentSize > limit,
  };
};
