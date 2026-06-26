# Step 4: Hooks and Components

The final phase involves refactoring your application components to consume the reactive PowerSync database instead of your custom SQLite hooks.

## 1. Deprecate Old Hooks (`src/app/hooks/useSQLite.ts`)
Your current `useSQLite.ts` hook handles raw Capacitor connections. We will either delete this file or deprecate it, as PowerSync abstracts away the connection lifecycle entirely.

## 2. Reactive Queries (`useQuery`)
We will update your components to read data using the `@powersync/react` hooks. 
The `useQuery` hook accepts standard SQL queries. When the underlying data changes, the hook automatically triggers a re-render with the new data.

```tsx
import { useQuery } from '@powersync/react';

export function WorkoutList() {
  // This hook is fully reactive!
  const { data: workouts, isLoading } = useQuery('SELECT * FROM workouts ORDER BY date DESC');
  
  if (isLoading) return <div>Loading workouts...</div>;

  return (
    <ul>
      {workouts.map(workout => (
        <li key={workout.id}>{workout.name}</li>
      ))}
    </ul>
  )
}
```

## 3. Standard Mutations
To write data, you will simply grab the `db` instance and execute a SQL command. Because of PowerSync's architecture, executing this command will instantly trigger `useQuery` to update any components relying on that data.

```tsx
import { usePowerSync } from '@powersync/react';

export function AddWorkout() {
  const db = usePowerSync();

  const handleAdd = async () => {
    await db.execute('INSERT INTO workouts (id, name, date) VALUES (uuid(), ?, ?)', [
      'Morning Run',
      new Date().toISOString()
    ]);
  };

  return <button onClick={handleAdd}>Add Workout</button>;
}
```

## Verification
*   Trigger an `INSERT` command from the UI.
*   Verify that the data list instantly updates without requiring a manual page refresh, `useEffect` dependency array hack, or manual state management.
