const PostVariant = require('../models/PostVariant');
const PostAnalytics = require('../models/PostAnalytics');
const Analytics = require('../models/Analytics');

/**
 * Generates mock analytics for a newly published post variant.
 * Also updates the daily analytics snapshot for the associated account.
 */
const generateMockPostAnalytics = async (variantId) => {
    try {
        const variant = await PostVariant.findById(variantId);
        if (!variant) return;

        // 1. Create Post-Specific Analytics
        const mockLikes = Math.floor(Math.random() * 80) + 20;
        const mockImpressions = Math.floor(Math.random() * 1500) + 500;
        const mockClicks = Math.floor(Math.random() * 40) + 10;
        const mockComments = Math.floor(Math.random() * 15);

        await PostAnalytics.create({
            postVariantId: variant._id,
            metrics: {
                likes: mockLikes,
                shares: Math.floor(mockLikes * 0.2),
                comments: mockComments,
                impressions: mockImpressions,
                clicks: mockClicks
            }
        });

        // 2. Update Daily Account Analytics Snapshot
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let dailySnapshot = await Analytics.findOne({
            socialAccountId: variant.socialAccountId,
            date: today
        });

        if (!dailySnapshot) {
            // If no snapshot exists for today, create one by projecting from the last available one
            const lastSnapshot = await Analytics.findOne({ socialAccountId: variant.socialAccountId }).sort({ date: -1 });
            dailySnapshot = await Analytics.create({
                socialAccountId: variant.socialAccountId,
                date: today,
                followers: lastSnapshot ? lastSnapshot.followers + Math.floor(Math.random() * 10) : 1000,
                impressions: 0,
                engagement: 0,
                reach: 0
            });
        }

        // Add the post's mock impact to today's totals
        dailySnapshot.impressions += mockImpressions;
        dailySnapshot.engagement += (mockLikes + mockComments);
        dailySnapshot.reach += Math.floor(mockImpressions * 0.8);
        dailySnapshot.likes += mockLikes;
        
        // Mock sentiment update (random drift towards positive for mock data)
        const currentScore = dailySnapshot.sentimentScore || 0;
        const drift = (Math.random() * 0.4) - 0.1; // drift slightly positive
        dailySnapshot.sentimentScore = Math.max(-1, Math.min(1, currentScore + drift));
        dailySnapshot.sentimentLabel = dailySnapshot.sentimentScore > 0.2 ? 'positive' : dailySnapshot.sentimentScore < -0.2 ? 'negative' : 'neutral';

        await dailySnapshot.save();

        console.log(`[Mock Analytics] Generated pulse for post ${variantId} on platform ${variant.platform}`);
    } catch (err) {
        console.error('[Mock Analytics Error]:', err.message);
    }
};

module.exports = { generateMockPostAnalytics };
