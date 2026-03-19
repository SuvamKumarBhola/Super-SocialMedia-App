const cron = require('node-cron');
const { processScheduledPosts } = require('../services/schedulerService');

/**
 * Scheduled Post Worker using node-cron (Redis-free)
 * Polling interval: every 1 minute
 */

// Schedule the task to run every minute
// '* * * * *' means "every minute"
const schedulerJob = cron.schedule('* * * * *', async () => {
  try {
    await processScheduledPosts();
  } catch (error) {
    console.error('[Worker] Cron job error:', error.message);
  }
});

console.log('[Worker] Scheduled Post Worker (cron) initialized. Polling every minute.');

module.exports = {
  schedulerJob
};
