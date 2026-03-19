const Campaign = require('../models/Campaign');
const Post = require('../models/Post');
const PostVariant = require('../models/PostVariant');
const PostAnalytics = require('../models/PostAnalytics');

// Create a new campaign
exports.createCampaign = async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;
    const organizationId = req.user.activeOrgId;

    if (!organizationId) {
      return res.status(403).json({ message: 'No active organization selected' });
    }

    const campaign = await Campaign.create({
      name,
      description,
      organizationId,
      startDate,
      endDate
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Failed to create campaign' });
  }
};

// Get all campaigns for an organization
exports.getCampaigns = async (req, res) => {
  try {
    const organizationId = req.user.activeOrgId;

    if (!organizationId) {
      return res.status(403).json({ message: 'No active organization selected' });
    }

    const campaigns = await Campaign.find({ organizationId }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Failed to fetch campaigns' });
  }
};

// Get a single campaign by ID with its aggregate analytics
exports.getCampaignAnalytics = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const organizationId = req.user.activeOrgId;

    const campaign = await Campaign.findOne({ _id: campaignId, organizationId });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // 1. Find all parent posts for this campaign
    const posts = await Post.find({ campaignId });
    const postIds = posts.map(p => p._id);

    // 2. Find all variations for these posts
    const variants = await PostVariant.find({ postId: { $in: postIds } });
    const variantIds = variants.map(v => v._id);

    // 3. Find latest analytics for these variants
    let totalLikes = 0;
    let totalShares = 0;
    let totalComments = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let postsCount = 0;

    for (const vid of variantIds) {
      const analytics = await PostAnalytics.findOne({ postVariantId: vid }).sort({ timestamp: -1 });
      if (analytics) {
        postsCount++;
        totalLikes += analytics.metrics.likes || 0;
        totalShares += analytics.metrics.shares || 0;
        totalComments += analytics.metrics.comments || 0;
        totalImpressions += analytics.metrics.impressions || 0;
        totalClicks += analytics.metrics.clicks || 0;
      }
    }

    res.json({
      campaign,
      analytics: {
        postsCount,
        totalLikes,
        totalShares,
        totalComments,
        totalImpressions,
        totalClicks,
        totalEngagement: totalLikes + totalShares + totalComments
      }
    });

  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({ message: 'Failed to fetch campaign analytics' });
  }
};
