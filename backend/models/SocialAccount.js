const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  platform: { type: String, enum: ['instagram', 'facebook', 'x', 'linkedin', 'youtube'], required: true },
  platformUserId: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String },
  expiry: { type: Date },
  profileData: { type: mongoose.Schema.Types.Mixed }, // Store avatar, handle, etc.
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SocialAccount', socialAccountSchema);
