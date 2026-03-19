const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderType: {
    type: String,
    enum: ['follower', 'user'], // follower = external user, user = internal platform user
    required: true
  },
  platformMessageId: {
    type: String, // ID of message on the actual platform (for tracking replies)
  },
  content: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

messageSchema.index({ conversationId: 1, timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema);
