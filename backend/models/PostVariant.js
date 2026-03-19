const mongoose = require('mongoose');

const postVariantSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  platform: { type: String, enum: ['instagram', 'facebook', 'x', 'linkedin', 'youtube'], required: true },
  socialAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'SocialAccount', required: true },
  caption: { type: String },
  status: { type: String, enum: ['pending', 'scheduled', 'published', 'failed'], default: 'pending' },
  platformPostId: { type: String }, // ID returned by platform after post
});

module.exports = mongoose.model('PostVariant', postVariantSchema);
