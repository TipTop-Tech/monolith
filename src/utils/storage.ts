import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { WorkoutHistory } from '../app/context/WorkoutContext';
import { Capacitor } from '@capacitor/core';

const sqlite = new SQLiteConnection(CapacitorSQLite);
const DB_NAME = 'WorkoutDB';

// Cache the connection instance to prevent multiple connection attempts
let dbInstance: SQLiteDBConnection | null = null;

/**
 * Initializes and opens the SQLite instance. 
 * Creates the workoutHistory table if it doesn't exist.
 */
export const initDB = async (): Promise<SQLiteDBConnection> => {
  // Bypass caching in test environments to allow isolated mocking
  if (dbInstance && process.env.NODE_ENV !== 'test') return dbInstance;

  // Initialize the web store engine if running in the browser
  if (Capacitor.getPlatform() === 'web') {
    await sqlite.initWebStore();
  }

  try {
    // Check if the connection is already registered in the Capacitor ecosystem
    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;
    if (isConn) {
      dbInstance = await sqlite.retrieveConnection(DB_NAME, false);
    } else {
      dbInstance = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    }

    await dbInstance.open();

    // exerciseId acts as the unique identifier, while the raw object is stringified in 'data'
    const schema = `
      CREATE TABLE IF NOT EXISTS workoutHistory (
        exerciseId TEXT PRIMARY KEY NOT NULL,
        data TEXT NOT NULL
      );
    `;
    await dbInstance.execute(schema);
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize SQLite DB:', error);
    throw error;
  }
};

/**
 * Retrieves all records from the workoutHistory table.
 * Parses the JSON string back into standard JavaScript objects.
 */
export const getHistoryFromDB = async (): Promise<WorkoutHistory[]> => {
  const db = await initDB();
  try {
    const res = await db.query('SELECT data FROM workoutHistory');

    if (res.values && res.values.length > 0) {
      return res.values.map(row => JSON.parse(row.data));
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return [];
  }
};

/**
 * Saves the full list of workout histories. 
 * Clears the table and writes new records using a batched insert.
 */
export const saveHistoryToDB = async (history: WorkoutHistory[]): Promise<void> => {
  const db = await initDB();
  try {
    // Clear existing to keep exact sync (Replaces IndexedDB's store.clear())
    await db.execute('DELETE FROM workoutHistory;');

    if (history.length === 0) return;

    // Build a single bulk-insert statement for optimal performance
    let insertSql = 'INSERT INTO workoutHistory (exerciseId, data) VALUES ';
    const values: any[] = [];

    history.forEach((entry, index) => {
      insertSql += '(?, ?)';
      if (index < history.length - 1) insertSql += ', ';

      // Assumes WorkoutHistory has an exerciseId property (based on the old keyPath)
      values.push((entry as any).exerciseId, JSON.stringify(entry));
    });

    await db.run(insertSql, values);
  } catch (error) {
    console.error('Failed to save history:', error);
    throw error;
  }
};

/**
 * Migrates legacy workout history data stored in standard localStorage to SQLite.
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