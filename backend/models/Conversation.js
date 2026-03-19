const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  socialAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialAccount',
    required: true
  },
  platform: {
    type: String,
    enum: ['instagram', 'facebook', 'x', 'linkedin', 'youtube'],
    required: true
  },
  type: {
    type: String,
    enum: ['dm', 'comment'],
    required: true
  },
  participantId: {
    type: String, // Platform's internal ID for the follower/user
    required: true
  },
  participantName: {
    type: String,
    required: true
  },
  participantAvatar: {
    type: String
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  lastMessagePreview: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Prevent duplicate conversations with the same person on the same platform thread
conversationSchema.index({ socialAccountId: 1, participantId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
