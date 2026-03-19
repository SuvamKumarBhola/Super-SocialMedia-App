const cron = require('node-cron');
const { syncAllAccounts } = require('../services/analyticsService');

// Analytics Worker using node-cron (Redis-free)
// Schedule: Every 6 hours ('0 0 */6 * * *')

// Schedule the task to run every 6 hours
const analyticsJob = cron.schedule('0 */6 * * *', async () => {
  try {
    console.log('[Worker] Starting periodic analytics sync...');
    await syncAllAccounts();
  } catch (error) {
    console.error('[Worker] Analytics cron job error:', error.message);
  }
});

// Run an initial sync on startup (optional, but helpful for immediate data)
const runInitialSync = async () => {
    console.log('[Worker] Running initial analytics sync on startup...');
    try {
        await syncAllAccounts();
    } catch (error) {
        console.error('[Worker] Initial sync error:', error.message);
    }
};

if (process.env.NODE_ENV !== 'test') {
    // Small delay to ensure DB is connected
    setTimeout(runInitialSync, 10000); 
}

console.log('[Worker] Analytics Worker (cron) initialized. Scheduled for every 6 hours.');

module.exports = {
  analyticsJob
};
