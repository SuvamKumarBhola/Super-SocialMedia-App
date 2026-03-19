const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  socialAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'SocialAccount', required: true },
  date: { type: Date, required: true },
  followers: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  reach: { type: Number, default: 0 },
  engagement: { type: Number, default: 0 }, // usually computed as generic engagement (likes+comments)/followers
  views: { type: Number, default: 0 },
  watchTime: { type: Number, default: 0 },
  sentimentScore: { type: Number, default: 0 }, // average sentiment from -1 to 1
  sentimentLabel: { type: String, default: 'neutral' },
});

// Compound index to ensure 1 snapshot per day per account
analyticsSchema.index({ socialAccountId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
