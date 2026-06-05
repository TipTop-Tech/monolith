import { WorkoutHistory } from '../app/context/WorkoutContext';

const DB_NAME = 'WorkoutDB';
const DB_VERSION = 1;
const STORE_NAME = 'workoutHistory';
/**
 * Initializes the IndexedDB database.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
 * 
 * initDB(): Initializes and opens the IndexedDB instance. 
 * If it's a first-time setup (or upgrade), 
 * it creates the workoutHistory object store with { keyPath: 'exerciseId' }.
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'exerciseId' });
      }
    };
  });
};
/*
 Gets history from a database
 @returns {Promise<WorkoutHistory[]>} A promise that resolves with the workout history.

 getHistoryFromDB(): Retrieves all records from the 
 workoutHistory object store in a read-only transaction.
*/
export const getHistoryFromDB = async (): Promise<WorkoutHistory[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};
/**
 * Saves history to a database.
 * @param history 
 * @returns a Promise that resolves when the history is saved.
 * 
 * saveHistoryToDB(): Saves the full list of workout histories. 
 * To ensure the database stays perfectly in sync with the React application state, 
 * it clears the object store and writes the new/updated records back in a read-write transaction.
 */
export const saveHistoryToDB = async (history: WorkoutHistory[]): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing to keep exact sync
    const clearRequest = store.clear();

    clearRequest.onsuccess = () => {
      history.forEach((entry) => {
        store.put(entry);
      });
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};
/**
 * 
 * @returns A promise that resolves with the migrated workout history, or null if no migration was needed.
 * 
 * migrateFromLocalStorage(): Migrates legacy workout history 
 * data stored under the "workoutHistory" key in 
 * standard localStorage to IndexedDB, clearing the old key to free space.
 */
export const migrateFromLocalStorage = async (): Promise<WorkoutHistory[] | null> => {
  const stored = localStorage.getItem('workoutHistory');
  if (stored) {
    try {
      const parsed: WorkoutHistory[] = JSON.parse(stored);
      await saveHistoryToDB(parsed);
      localStorage.removeItem('workoutHistory');
      return parsed;
    } catch (e) {
      console.error('Failed to migrate from local storage', e);
    }
  }
  return null;
};
