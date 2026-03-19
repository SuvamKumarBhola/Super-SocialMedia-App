const SocialAccount = require('../models/SocialAccount');
const Analytics = require('../models/Analytics');
const telegramService = require('../services/telegramService');

// Simulate fetching analytics from external APIs based on the platform
const generateMockAnalytics = (platform) => {
  const baseFollowers = Math.floor(Math.random() * 50000) + 1000;
  const growth = Math.floor(Math.random() * 100) - 20; // Allow negative growth
  const followers = baseFollowers + growth;
  
  const reach = Math.floor(followers * (Math.random() * 0.5 + 0.1)); // 10% to 60% of followers
  const impressions = Math.floor(reach * (Math.random() * 1.5 + 1)); // 1x to 2.5x reach
  const engagement = Math.floor(reach * (Math.random() * 0.1 + 0.01)); // 1% to 11% of reach
  
  const views = platform === 'youtube' || platform === 'instagram' ? Math.floor(impressions * 0.8) : 0;
  const watchTime = platform === 'youtube' ? Math.floor(views * (Math.random() * 300 + 30)) : 0; // random seconds per view

  return {
    followers,
    reach,
    impressions,
    engagement,
    views,
    watchTime,
  };
};

const syncAnalyticsForAccount = async (accountId) => {
  try {
    const account = await SocialAccount.findById(accountId);
    if (!account) throw new Error('Account not found');

    const mockData = generateMockAnalytics(account.platform);
    
    // Create a snapshot for the current date (truncate time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snapshot = await Analytics.findOneAndUpdate(
      { socialAccountId: accountId, date: today },
      { 
        ...mockData,
        likes: Math.floor(mockData.engagement * 0.8), // Mock likes as 80% of engagement
      },
      { upsert: true, new: true }
    );

    return snapshot;
  } catch (error) {
    console.error(`Failed to sync analytics for account ${accountId}:`, error.message);
    throw error;
  }
};

const syncAllAccounts = async () => {
  try {
    const accounts = await SocialAccount.find();
    console.log(`Starting analytics sync for ${accounts.length} accounts...`);
    
    for (const account of accounts) {
      await syncAnalyticsForAccount(account._id);
    }
    
    console.log('Analytics sync completed!');
    
    // Notify Telegram
    const syncMsg = `📊 <b>Analytics Sync Completed</b>\n\nSynced data for <b>${accounts.length}</b> social accounts.`;
    await telegramService.sendNotification(syncMsg);
  } catch (error) {
    console.error('Failed mass sync:', error.message);
  }
};

module.exports = {
  syncAnalyticsForAccount,
  syncAllAccounts,
  generateMockAnalytics
};
