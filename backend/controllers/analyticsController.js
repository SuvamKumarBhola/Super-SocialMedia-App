const Analytics = require('../models/Analytics');
const SocialAccount = require('../models/SocialAccount');

const getGlobalStats = async (req, res) => {
  try {
    const { orgId } = req.params;
    
    // Find all accounts for the org
    const accounts = await SocialAccount.find({ organizationId: orgId });
    if (!accounts.length) return res.json({ followers: 0, engagement: 0, impressions: 0 });

    const accountIds = accounts.map(a => a._id);

    // Get the latest snapshot for each account
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const latestSnapshots = await Analytics.find({
      socialAccountId: { $in: accountIds },
      date: today
    });

    // If no snapshots today, try yesterday (for edge cases)
    let snapshotsToUse = latestSnapshots;
    if (!snapshotsToUse.length) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        snapshotsToUse = await Analytics.find({
            socialAccountId: { $in: accountIds },
            date: yesterday
        });
    }

    let totalFollowers = 0;
    let totalEngagement = 0;
    let totalImpressions = 0;

    snapshotsToUse.forEach(snap => {
      totalFollowers += snap.followers;
      totalEngagement += snap.engagement;
      totalImpressions += snap.impressions;
    });

    res.json({
      followers: totalFollowers,
      engagement: totalEngagement,
      impressions: totalImpressions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChartData = async (req, res) => {
  try {
    const { orgId } = req.params;
    
    // We want the last 7 days of data
    const accounts = await SocialAccount.find({ organizationId: orgId });
    if (!accounts.length) return res.json([]);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const snapshots = await Analytics.find({
      socialAccountId: { $in: accounts.map(a => a._id) },
      date: { $gte: startDate }
    }).populate('socialAccountId', 'platform name');

    // Transform into a flat array grouped by date for Recharts
    // Returns format: [{ date: '2023-10-01', instagram_followers: 100, x_followers: 200, total_followers: 300 }, ...]
    
    const chartMap = {};

    snapshots.forEach(snap => {
      const dateStr = snap.date.toISOString().split('T')[0];
      const platform = snap.socialAccountId.platform;
      
      if (!chartMap[dateStr]) {
        chartMap[dateStr] = { date: dateStr, total_followers: 0, total_engagement: 0, total_impressions: 0 };
      }
      
      chartMap[dateStr][`${platform}_followers`] = snap.followers;
      chartMap[dateStr][`${platform}_engagement`] = snap.engagement;
      
      chartMap[dateStr].total_followers += snap.followers;
      chartMap[dateStr].total_engagement += snap.engagement;
      chartMap[dateStr].total_impressions += snap.impressions;
      chartMap[dateStr].sentiment_score = snap.sentimentScore;
    });

    // Return array sorted by date
    const result = Object.values(chartMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPlatformComparison = async (req, res) => {
  try {
    // Simply return the latest stats broken down by platform
    const { orgId } = req.params;
    
    const accounts = await SocialAccount.find({ organizationId: orgId });
    if (!accounts.length) return res.json([]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snapshots = await Analytics.find({
        socialAccountId: { $in: accounts.map(a => a._id) },
        date: today
    }).populate('socialAccountId', 'platform profileData');

    const result = snapshots.map(snap => {
        // Calculate engagement percentage safely
        const rate = snap.followers > 0 ? ((snap.engagement / snap.followers) * 100).toFixed(2) : 0;
        
        return {
            platform: snap.socialAccountId.platform,
            username: snap.socialAccountId.profileData?.username || 'Unknown',
            followers: snap.followers,
            engagement: snap.engagement,
            engagementRate: `${rate}%`,
            impressions: snap.impressions,
            reach: snap.reach
        };
    });

    res.json(result);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

const getContentTypeComparison = async (req, res) => {
  try {
    const { orgId } = req.params;
    
    // We need to fetch all Posts for this org
    const Post = require('../models/Post');
    const PostVariant = require('../models/PostVariant');
    const PostAnalytics = require('../models/PostAnalytics');

    const posts = await Post.find({ organizationId: orgId });
    if (!posts.length) return res.json([]);

    // Initialize metrics per content type
    const metrics = {
      text: { type: 'Text', count: 0, engagement: 0, impressions: 0, clicks: 0 },
      image: { type: 'Image', count: 0, engagement: 0, impressions: 0, clicks: 0 },
      carousel: { type: 'Carousel', count: 0, engagement: 0, impressions: 0, clicks: 0 },
      video: { type: 'Video', count: 0, engagement: 0, impressions: 0, clicks: 0 }
    };

    // Determine content type for each post and store post IDs
    const postMap = {}; // postId -> contentType
    for (const p of posts) {
      let type = 'text';
      if (p.media && p.media.length > 0) {
        if (p.media.some(m => m.type === 'video')) {
          type = 'video';
        } else if (p.media.length > 1) {
          type = 'carousel';
        } else {
          type = 'image';
        }
      }
      postMap[p._id.toString()] = type;
      metrics[type].count += 1; // Count parent posts (or we could count variants later)
    }

    // Find all variants
    const postIds = Object.keys(postMap);
    const variants = await PostVariant.find({ postId: { $in: postIds } });

    // For each variant, fetch the latest analytics
    for (const v of variants) {
      const type = postMap[v.postId.toString()];
      const latestAnalytics = await PostAnalytics.findOne({ postVariantId: v._id }).sort({ timestamp: -1 });
      
      if (latestAnalytics) {
        const eng = (latestAnalytics.metrics.likes || 0) + 
                    (latestAnalytics.metrics.comments || 0) + 
                    (latestAnalytics.metrics.shares || 0);
        
        metrics[type].engagement += eng;
        metrics[type].impressions += latestAnalytics.metrics.impressions || 0;
        metrics[type].clicks += latestAnalytics.metrics.clicks || 0;
      }
    }

    // Convert to array and filter out types with 0 count
    const result = Object.values(metrics).filter(m => m.count > 0);

    // Calculate averages
    res.json(result.map(m => ({
      ...m,
      avgEngagement: m.count > 0 ? (m.engagement / m.count).toFixed(1) : 0,
      avgImpressions: m.count > 0 ? (m.impressions / m.count).toFixed(1) : 0,
      avgClicks: m.count > 0 ? (m.clicks / m.count).toFixed(1) : 0
    })));

  } catch (error) {
    console.error('Error in getContentTypeComparison:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGlobalStats,
  getChartData,
  getPlatformComparison,
  getContentTypeComparison
};
