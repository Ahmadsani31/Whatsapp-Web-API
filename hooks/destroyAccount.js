const path = require('path');
const { rm } = require('fs/promises');
const logMessage = require('../ultis/logger');



// Destroy client
const destroyAccount = async (clients, accountId) => {

    const SESSIONS_DIR = path.join(__dirname, "../sessions_auth");


    console.log(SESSIONS_DIR);
    console.log('accountId', accountId);
    const PATH_SESSIONS = path.join(SESSIONS_DIR, `session-${accountId}`);
    console.log(PATH_SESSIONS);
    try {

        const client = clients.get(accountId);
        if (client) {
            await client.logout();
            await client.destroy();
            clients.delete(accountId);
            await rm(PATH_SESSIONS, { recursive: true, force: true }, (err) => {
                if (err) {
                    console.error('Error deleting folder:', err);
                    logMessage(`Error deleting folder: ${err}`);
                } else {
                    console.log('Folder deleted successfully');
                    logMessage(`Folder deleted successfully`);
                }
            });
            logMessage(`Account ${accountId} destroyed successfully`);
            return { success: true, message: `Account ${accountId} destroyed successfully` };
        } else {
            logMessage(`Account ${accountId} not found`);
            return { success: false, message: `Account ${accountId} not found` };
        }
    } catch (error) {
        logMessage(`Error destroyed account: ${error}`);
        return { success: false, message: `Error destroyed account: ${error}` };
    }

};

module.exports = destroyAccount;