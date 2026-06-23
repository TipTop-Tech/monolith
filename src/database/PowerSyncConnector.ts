import { PowerSyncBackendConnector, AbstractPowerSyncDatabase } from '@powersync/web';
import { supabase } from './supabase';

export class Connector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    let { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return null;
    }
    
    return {
        endpoint: import.meta.env.VITE_POWERSYNC_URL || 'https://6a2f6aef35ca576ca0dcc181.powersync.journeyapps.com',
        token: session.access_token || ''
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase) {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    try {
      for (const operation of transaction.crud) {
        const table = operation.table;
        if (operation.op === 'PUT') {
          const dataToInsert = { ...operation.opData, id: operation.id };
          const { error } = await supabase.from(table).upsert(dataToInsert);
          if (error) throw new Error(`Could not insert into ${table}: ${error.message}`);
        } else if (operation.op === 'PATCH') {
          const { error } = await supabase.from(table).update(operation.opData).eq('id', operation.id);
          if (error) throw new Error(`Could not update ${table}: ${error.message}`);
        } else if (operation.op === 'DELETE') {
          const { error } = await supabase.from(table).delete().eq('id', operation.id);
          if (error) throw new Error(`Could not delete from ${table}: ${error.message}`);
        }
      }
      await transaction.complete();
    } catch (ex: any) {
      console.error('Data upload error:', ex.message);
      throw ex;
    }
  }
}
