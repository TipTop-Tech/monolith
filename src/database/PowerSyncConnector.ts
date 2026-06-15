import { PowerSyncBackendConnector, AbstractPowerSyncDatabase, UpdateType } from '@powersync/web';

export class Connector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    // Implement fetchCredentials to obtain a JWT from your authentication service.
    // See https://docs.powersync.com/installation/authentication-setup
    // If you're using Supabase or Firebase, you can re-use the JWT from those clients, see
    // - https://docs.powersync.com/installation/authentication-setup/supabase-auth
    // - https://docs.powersync.com/installation/authentication-setup/firebase-auth
    return {
        endpoint: 'https://6a2f6aef35ca576ca0dcc181.powersync.journeyapps.com',
        // Use a development token (see Authentication Setup https://docs.powersync.com/installation/authentication-setup/development-tokens) to get up and running quickly
        token: 'An authentication token' // Replace with your actual development token or fetch it dynamically
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase) {
    // Implement uploadData to send local changes to your backend service.
    // You can omit this method if you only want to sync data from the database to the client

    // See example implementation here: https://docs.powersync.com/client-sdk-references/javascript-web#3-integrate-with-your-backend
  }
}
