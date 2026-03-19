const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const telegramService = require('../services/telegramService');

const MOCK_MESSAGES = [
  "Hey! Loved your recent post.",
  "Is this product available internationally?",
  "Can we collaborate?",
  "Great insights, thanks for sharing!",
  "When is the next release?"
];

const MOCK_NAMES = ["John Doe", "Jane Smith", "Alex Johnson", "Sarah Williams", "Chris Davis"];

// Generates fake inbox data for testing the UI
const generateMockInboxData = async (organizationId, socialAccountId, platform) => {
  try {
    // Generate 3 random conversations
    for (let i = 0; i < 3; i++) {
      const type = Math.random() > 0.5 ? 'dm' : 'comment';
      const pName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
      const textPreview = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];

      const conv = await Conversation.findOneAndUpdate(
        { socialAccountId, participantId: `mock_user_${i}_${platform}`, type },
        {
          organizationId,
          platform,
          participantName: pName,
          participantAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(pName)}`,
          lastMessageAt: new Date(Date.now() - Math.random() * 100000000), // Random past time
          lastMessagePreview: textPreview,
          isRead: false
        },
        { upsert: true, new: true }
      );

      // Create a few messages inside
      const msgCount = await Message.countDocuments({ conversationId: conv._id });
      if (msgCount === 0) {
        
        // Randomly assign sentiment for testing UI
        const rand = Math.random();
        let sentiment = 'neutral';
        if (rand > 0.7) sentiment = 'positive';
        else if (rand < 0.3) sentiment = 'negative';

        await Message.create({
          conversationId: conv._id,
          senderType: 'follower',
          sentiment,
          timestamp: conv.lastMessageAt
        });

        // Notify Telegram
        const inboxNotifyMsg = `💬 <b>New Interaction</b>\n\n<b>From:</b> ${pName}\n<b>Platform:</b> ${platform}\n<b>Type:</b> ${type === 'dm' ? '📥 Direct Message' : '💬 Comment'}\n\n<b>Message:</b>\n<i>${textPreview}</i>`;
        await telegramService.sendNotification(inboxNotifyMsg);
        
        // Sometimes add a mocked old reply
        if (Math.random() > 0.5) {
           await Message.create({
              conversationId: conv._id,
              senderType: 'user',
              content: "Thanks for reaching out!",
              sentiment: 'neutral',
              timestamp: new Date(conv.lastMessageAt.getTime() + 60000)
           });
        }
      }
    }
  } catch (error) {
    console.error('Failed to generate mock inbox data:', error.message);
  }
};

module.exports = {
  generateMockInboxData
};
