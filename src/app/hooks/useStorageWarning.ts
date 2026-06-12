import { useState, useCallback } from 'react';
import { checkStorageQuota, StorageStatus } from '../../utils/storageMonitor';

/**
 * This custom hook checks for storage quota usage and displays warnings when exceeded
 * 
 * @returns {Object} - Contains state and functions to manage storage warnings
 * - showWarning: Boolean indicating if a warning should be displayed
 * - storageStatus: Object containing storage quota information
 * - checkStorage: Function to check storage quota
 * - dismissWarning: Function to dismiss the warning
 */
export const useStorageWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);

  const checkStorage = useCallback(async () => {
    const status = await checkStorageQuota();
    if (status.exceeded) {
      setStorageStatus(status);
      setShowWarning(true);
    }
    return status;
  }, []);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
  }, []);

  return {
    showWarning,
    storageStatus,
    checkStorage,
    dismissWarning
  };
};
