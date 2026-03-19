const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  baseCaption: { type: String },
  media: [{ url: String, type: { type: String, enum: ['image', 'video'] } }],
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'scheduled', 'published', 'failed'],
    default: 'draft'
  },
  approvalStatus: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved' // Defaulting to approved to not break old posts
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewMessage: {
    type: String
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);
