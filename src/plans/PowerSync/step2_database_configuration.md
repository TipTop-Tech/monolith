# Step 2: Database Configuration

In this phase, we establish the local SQLite schema and configure the PowerSync Database instance so it understands your tables.

## 1. Define the Schema (`src/database/schema.ts`)
PowerSync requires an explicit schema definition. Unlike typical SQLite setups where you just run `CREATE TABLE` queries, PowerSync uses an `AppSchema` object. This schema is what enables the reactivity engine to track exactly which tables and columns exist.

```typescript
import { column, Schema, Table } from '@powersync/web';

export const AppSchema = new Schema({
  workouts: new Table({
    name: column.text,
    date: column.text,
    // Add additional fields as needed (e.g., duration, notes)
  }),
  // Define additional tables here (e.g., sets, exercises)
});
```

## 2. Initialize the Database (`src/database/index.ts`)
We will create a singleton instance of the `PowerSyncDatabase`. 
The beauty of the PowerSync Capacitor SDK is that it performs platform detection automatically. You simply initialize it, and it will use native SQLite on iOS/Android, and `wa-sqlite` on the Web.

```typescript
import { PowerSyncDatabase } from '@powersync/web';
import { AppSchema } from './schema';

export const db = new PowerSyncDatabase({
  schema: AppSchema,
  database: {
    dbFilename: 'workout_tracker.db'
  }
});
```

## Verification
*   We will temporarily import `db` into `src/main.tsx` and run `db.init()`.
*   We'll verify via browser dev tools (or native logs) that the database file `workout_tracker.db` is successfully created without throwing initialization errors.
