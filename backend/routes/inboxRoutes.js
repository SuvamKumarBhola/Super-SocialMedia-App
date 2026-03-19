const express = require('express');
const router = express.Router();
const { getConversations, getMessages, replyToConversation } = require('../controllers/inboxController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations/:orgId', protect, getConversations);
router.get('/:conversationId/messages', protect, getMessages);
router.post('/:conversationId/reply', protect, replyToConversation);

module.exports = router;
