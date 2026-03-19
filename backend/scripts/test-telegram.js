require('dotenv').config();
const { sendNotification } = require('./services/telegramService');

async function testTelegram() {
  console.log('--- Telegram Notification Test ---');
  console.log('Token:', process.env.TELEGRAM_BOT_TOKEN ? '✅ Found' : '❌ Missing');
  console.log('Chat ID:', process.env.TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID_HERE' ? '⚠️ Placeholder' : (process.env.TELEGRAM_CHAT_ID ? '✅ Found' : '❌ Missing'));

  if (process.env.TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID_HERE') {
    console.log('\n[ERROR] You must update TELEGRAM_CHAT_ID in .env before testing.');
    process.exit(1);
  }

  const testMsg = '🔔 <b>Test Notification</b>\n\nThis is a test message from Creator OS to verify your Telegram Bot integration.';
  
  console.log('\nSending test notification...');
  const result = await sendNotification(testMsg);

  if (result.success) {
    console.log('✅ Success! Check your Telegram bot.');
  } else {
    console.log('❌ Failed:', result.error);
    process.exit(1);
  }
}

testTelegram();
