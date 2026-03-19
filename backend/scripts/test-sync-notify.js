const mongoose = require('mongoose');
const { syncAllAccounts } = require('./services/analyticsService');
require('dotenv').config();

const testSync = async () => {
  try {
    console.log('--- Analytics Sync & Telegram Test ---');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // This will trigger notifications if accounts exist
    await syncAllAccounts();

    console.log('\n--- Test Finished ---');
    console.log('If you have social accounts connected, you should have received a Telegram notification.');
    process.exit(0);
  } catch (error) {
    console.error('Test Error:', error.message);
    process.exit(1);
  }
};

testSync();
