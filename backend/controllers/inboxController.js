const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const SocialAccount = require('../models/SocialAccount');
const { generateMockInboxData } = require('../services/inboxService');

const getConversations = async (req, res) => {
  try {
    const { orgId } = req.params;
    
    // Auto-generate some mock data for all connected accounts just to fill the UI for Phase 4 testing
    const accounts = await SocialAccount.find({ organizationId: orgId });
    for (const acc of accounts) {
        await generateMockInboxData(orgId, acc._id, acc.platform);
    }

    const conversations = await Conversation.find({ organizationId: orgId })
      .populate('socialAccountId', 'platform profileData')
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 }); // Oldest first for chat UI
      
    // Mark conversation as read
    await Conversation.findByIdAndUpdate(conversationId, { isRead: true });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const replyToConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    // 1. Create the message in DB
    const message = await Message.create({
      conversationId: conversation._id,
      senderType: 'user',
      content,
    });

    // 2. Update conversation preview
    conversation.lastMessagePreview = content;
    conversation.lastMessageAt = new Date();
    conversation.isRead = true;
    await conversation.save();

    // 3. (In real app) -> Call platform adapter (Meta API, X API) to actually send the reply here

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  replyToConversation
};
