import { column, Schema, Table } from '@powersync/web';

/**
 * Defines the local database schema for the PowerSync instance.
 * 
 * PowerSync uses an explicit schema definition to track which tables and columns
 * exist and manage data reactivity. This schema must correspond to the
 * remote database schema that will be synced down to the client.
 */
export const AppSchema = new Schema({
  /**
   * Represents users of the app.
   */
  users: new Table({
    username: column.text,
    email: column.text,
  }),
  /**
   * Tracks individual sets a user has accomplished for an exercise.
   */
  workoutHistory: new Table({
    userId: column.text,
    exerciseId: column.text,
    reps: column.integer,
    weight: column.real,
    date: column.text,
  })
});
