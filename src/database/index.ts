import { PowerSyncDatabase } from '@powersync/web';
import { AppSchema } from './schema';

/**
 * The singleton instance of the PowerSyncDatabase.
 * 
 * PowerSync performs automatic platform detection when initialized:
 * - On the Web, it utilizes WebAssembly (`@journeyapps/wa-sqlite`) to handle SQLite.
 * - On native platforms (iOS/Android) via Capacitor, it delegates to native SQLite bindings.
 * 
 * You must call `db.init()` before interacting with the database.
 */
export const db = new PowerSyncDatabase({
  schema: AppSchema,
  database: {
    // The underlying file name created in the device's file system or browser's OPFS.
    dbFilename: 'workout_tracker.db'
  }
});
