const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String, // e.g., 'created_post', 'approved_post', 'replied_message'
    required: true
  },
  resourceType: {
    type: String, // e.g., 'Post', 'Message'
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed // Flexible payload for extra context, e.g { captionPreview: "..." }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

activityLogSchema.index({ organizationId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
