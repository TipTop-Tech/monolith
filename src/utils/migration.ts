export const migrateData = async (sqliteDb: SQLiteDBConnection) => {
    const migrationFlag = localStorage.getItem('idb_to_sqlite_migrated');
    if (migrationFlag) return; // Already migrated

    try {
        // 1. Open your existing IndexedDB
        const idb = await openMyIndexedDB();
        const records = await getAllRecordsFromIDB(idb);

        // 2. Insert into SQLite
        // Using a transaction for speed and safety
        let sqlStatement = 'INSERT INTO users (id, name, data) VALUES ';
        const values: any[] = [];

        records.forEach((record, index) => {
            sqlStatement += `(?, ?, ?)`;
            if (index < records.length - 1) sqlStatement += ', ';
            values.push(record.id, record.name, JSON.stringify(record.data));
        });

        await sqliteDb.run(sqlStatement, values);

        // 3. Flag migration as complete
        localStorage.setItem('idb_to_sqlite_migrated', 'true');

        // Optional: Delete IndexedDB database to free up space
        // indexedDB.deleteDatabase('my_old_idb');

    } catch (error) {
        console.error("Migration failed: ", error);
    }
};
