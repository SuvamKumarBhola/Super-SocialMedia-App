const mongoose = require('mongoose');

const postAnalyticsSchema = new mongoose.Schema({
    postVariantId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostVariant', required: true },
    timestamp: { type: Date, default: Date.now },
    metrics: {
        likes: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 }
    }
});

module.exports = mongoose.model('PostAnalytics', postAnalyticsSchema);
