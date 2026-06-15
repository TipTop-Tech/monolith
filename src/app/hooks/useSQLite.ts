import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { migrateData } from '../../utils/migration';

const sqlite = new SQLiteConnection(CapacitorSQLite);

export const useSQLite = () => {
    const [db, setDb] = useState<SQLiteDBConnection | null>(null);

    useEffect(() => {
        const initDB = async () => {
            try {
                if (Capacitor.getPlatform() === 'web') {
                    await sqlite.initWebStore();
                }

                // Create or open the connection
                const dbConnection = await sqlite.createConnection(
                    'my_app_db',
                    false,
                    'no-encryption',
                    1,
                    false
                );

                await dbConnection.open();

                // Initialize Schema
                const schema = `
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            data TEXT
          );
        `;
                await dbConnection.execute(schema);
                setDb(dbConnection);

                // Call the migration right after the schema is ready
                await migrateData(dbConnection);

            } catch (err) {
                console.error('SQLite Init Error:', err);
            }
        };

        initDB();
    }, []);

    return { db };
};