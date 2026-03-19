const mongoose = require('mongoose');

const scheduledPostSchema = new mongoose.Schema({
  postVariantId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostVariant', required: true },
  scheduledTime: { type: Date, required: true },
  jobId: { type: String }, // BullMQ job ID
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed', 'paused'], default: 'pending' },
  errorLogs: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ScheduledPost', scheduledPostSchema);
