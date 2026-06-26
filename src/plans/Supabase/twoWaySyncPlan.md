# Upload Data Implementation Plan

This plan outlines the steps to connect your PowerSync local database back to your Supabase backend, enabling two-way synchronization by fully implementing the `uploadData` method and handling authentication.

## Proposed Changes

We will introduce the `@supabase/supabase-js` client, initialize anonymous authentication to generate JWT tokens for PowerSync, and translate PowerSync's local CRUD operations into Supabase REST calls.

---

### Package Dependencies

- Install `@supabase/supabase-js` to interface with the Supabase API.

### Environment Variables

We'll add a `.env` file (if not present) with your Supabase credentials:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

### Database Configurations

#### [NEW] `src/database/supabase.ts`
We will create this file to initialize the Supabase client.
- It will export the configured `supabase` instance for use within the connector.

#### [MODIFY] `src/database/PowerSyncConnector.ts`
- **Authentication**: 
  - Call `supabase.auth.signInAnonymously()` to ensure an active session.
  - Implement `fetchCredentials` to return the `access_token` from `supabase.auth.getSession()`.
- **Uploading Data**: 
  - Implement `uploadData(database)`.
  - Loop through `transaction.crud` (PowerSync provides an array of local changes in batches).
  - Use a switch statement on `operation.op` (PUT, PATCH, DELETE).
  - Map `PUT` to `supabase.from(table).upsert(operation.opData)`.
  - Map `PATCH` to `supabase.from(table).update(operation.opData).eq('id', operation.id)`.
  - Map `DELETE` to `supabase.from(table).delete().eq('id', operation.id)`.
  - Complete the transaction block with `transaction.complete()`.

#### [MODIFY] `src/main.tsx`
- Ensure that any necessary authentication initialization steps are triggered before connecting PowerSync, or let the connector handle it lazily.

## Open Questions

> [!IMPORTANT]
> **Authentication Setup**: Anonymous sign-in must be explicitly enabled in your Supabase dashboard (Authentication -> Providers -> Anonymous). Have you enabled this in your Supabase project?

> [!WARNING]
> **Row Level Security (RLS)**: For data to sync down and be updated/inserted properly, your tables (`users` and `workoutHistory`) in Supabase must have appropriate Row Level Security policies configured, or RLS disabled temporarily while testing. Is RLS configured to allow anonymous users to perform CRUD operations?

## Verification Plan

### Manual Verification
1. Open the browser and inspect the network tab to verify the PowerSync websocket connection is established successfully without 401 Unauthorized errors.
2. Verify that an anonymous user session is created in the application (check Local Storage for supabase auth token).
3. Insert a new record into `workoutHistory` locally using PowerSync `db.execute()`.
4. Check the Supabase dashboard to verify the new record was successfully inserted into the cloud database via the `uploadData` method.
