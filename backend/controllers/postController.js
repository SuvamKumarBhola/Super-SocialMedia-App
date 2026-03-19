const Post = require('../models/Post');
const PostVariant = require('../models/PostVariant');
const ScheduledPost = require('../models/ScheduledPost');
const ActivityLog = require('../models/ActivityLog');
const SocialAccount = require('../models/SocialAccount');

// Import Adapters for direct publishing (since we are disabling BullMQ for now)
const adapters = {
  instagram: require('../services/platformAdapters/instagram.service'),
  facebook: require('../services/platformAdapters/facebook.service'),
  x: require('../services/platformAdapters/x.service'),
  linkedin: require('../services/platformAdapters/linkedin.service'),
  youtube: require('../services/platformAdapters/youtube.service'),
};

// const { generateMockPostAnalytics } = require('../services/mockAnalyticsService');
// const telegramService = require('../services/telegramService');
// BullMQ logic removed - using node-cron polling in workers/postSchedulerWorker.js

// 1. Create a Post and its Variants
const createPost = async (req, res) => {
  try {
    let { orgId, baseCaption, media, platforms, scheduledTime, requiresApproval } = req.body;

    // Multer/FormData might send some fields as strings
    if (typeof platforms === 'string') platforms = JSON.parse(platforms);
    if (typeof media === 'string') media = JSON.parse(media);
    if (requiresApproval === 'true') requiresApproval = true;
    if (requiresApproval === 'false') requiresApproval = false;

    // If a file was uploaded, use its path as the media URL
    if (req.file) {
      const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
      const type = req.file.mimetype.startsWith('video') ? 'video' : 'image';
      media = [{ url: fileUrl, type }];
    }

    // Create base Post
    const post = await Post.create({
      organizationId: orgId,
      createdBy: req.user.id,
      baseCaption,
      media,
      status: requiresApproval ? 'pending_approval' : (scheduledTime ? 'scheduled' : 'published'),
      approvalStatus: requiresApproval ? 'pending' : 'approved'
    });

    const variants = [];

    // Create Variants for each platform
    for (const p of platforms) {
      const variant = await PostVariant.create({
        postId: post._id,
        platform: p.platform,
        socialAccountId: p.socialAccountId,
        caption: p.customCaption || baseCaption,
        status: requiresApproval ? 'pending' : (scheduledTime ? 'scheduled' : 'pending')
      });
      variants.push(variant);

      // Create Schedule entry
      const sTime = scheduledTime ? new Date(scheduledTime) : new Date(); // now if not provided

      const scheduledPost = await ScheduledPost.create({
        postVariantId: variant._id,
        scheduledTime: sTime,
        status: requiresApproval ? 'paused' : 'pending' // Pause execution if approval is needed
      });

      // If it's not scheduled (publish immediately), execute adapter now
      if (!scheduledTime && !requiresApproval) {
        try {
          const account = await SocialAccount.findById(variant.socialAccountId);
          const adapter = adapters[p.platform];
          if (adapter && account) {
            console.log(`[Direct Publish] Publishing to ${p.platform}...`);
            const result = await adapter.publish({ ...variant.toObject(), socialAccountId: account }, media);
            
            if (result.success) {
              variant.status = 'published';
              variant.platformPostId = result.platformPostId;
              await variant.save();
              
              scheduledPost.status = 'completed';
              await scheduledPost.save();

              // Generate Mock Analytics Pulse for immediate feedback
              generateMockPostAnalytics(variant._id);

              // Notify Telegram
              const pubSuccessMsg = `✅ <b>Successfully Published</b>\n\n<b>Platform:</b> ${p.platform}\n<b>Post ID:</b> ${result.platformPostId}`;
              await telegramService.sendNotification(pubSuccessMsg);
            } else {
              variant.status = 'failed';
              await variant.save();
              scheduledPost.status = 'failed';
              scheduledPost.errorLogs.push(result.error);
              await scheduledPost.save();

              // Notify Telegram
              const pubFailMsg = `❌ <b>Publishing Failed</b>\n\n<b>Platform:</b> ${p.platform}\n<b>Error:</b> ${result.error}`;
              await telegramService.sendNotification(pubFailMsg);
            }
          }
        } catch (pubErr) {
          console.error('[Direct Publish Error]:', pubErr.message);
        }
      }
    }

    // Update main post status if published immediately
    if (!scheduledTime && !requiresApproval) {
        post.status = 'published';
        await post.save();
    }

    // Log the activity
    await ActivityLog.create({
      organizationId: orgId,
      userId: req.user.id,
      action: requiresApproval ? 'submitted_post_for_approval' : (scheduledTime ? 'scheduled_post' : 'published_post'),
      resourceType: 'Post',
      resourceId: post._id,
    });
    
    // Notify via Telegram
    const notificationMsg = `🚀 <b>New Post Created</b>\n\n<b>Org ID:</b> ${orgId}\n<b>Platform(s):</b> ${platforms.map(p => p.platform).join(', ')}\n<b>Status:</b> ${requiresApproval ? 'Pending Approval' : (scheduledTime ? 'Scheduled' : 'Published')}\n\n<b>Caption Preview:</b>\n<i>${baseCaption.substring(0, 50)}...</i>`;
    
    if (req.file) {
      // Send the actual file to Telegram
      await telegramService.sendMedia(req.file.path, notificationMsg, req.file.mimetype.startsWith('video') ? 'video' : 'image');
    } else {
      await telegramService.sendNotification(notificationMsg);
    }

    res.status(201).json({ message: 'Post created successfully', post, variants });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Fetch Calendar Data
const getCalendarPosts = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { start, end } = req.query; // ISO dates

    // Find posts for this org
    const posts = await Post.find({ organizationId: orgId });
    const postIds = posts.map(p => p._id);

    // Find variants
    const variants = await PostVariant.find({ postId: { $in: postIds } });
    const variantIds = variants.map(v => v._id);

    // Find scheduled entries within date range
    const filter = { postVariantId: { $in: variantIds } };
    if (start && end) {
      filter.scheduledTime = { $gte: new Date(start), $lte: new Date(end) };
    }

    const scheduledPosts = await ScheduledPost.find(filter)
      .populate({
        path: 'postVariantId',
        populate: [
          { path: 'postId', select: 'media baseCaption status' },
          { path: 'socialAccountId', select: 'platform profileData' }
        ]
      })
      .sort({ scheduledTime: 1 });

    res.json(scheduledPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Review Post (Approve/Reject)
const reviewPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { approved, reviewMessage } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.approvalStatus = approved ? 'approved' : 'rejected';
    post.status = approved ? 'scheduled' : 'draft'; // If approved, goes to scheduled queue. If rejected, goes back to draft.
    post.reviewerId = req.user.id;
    post.reviewMessage = reviewMessage || '';

    await post.save();

    // Log the action
    await ActivityLog.create({
      organizationId: post.organizationId,
      userId: req.user.id,
      action: approved ? 'approved_post' : 'rejected_post',
      resourceType: 'Post',
      resourceId: post._id,
      metadata: { reviewMessage }
    });

    // Notify via Telegram
    const reviewNotifyMsg = `⚖️ <b>Post Reviewed</b>\n\n<b>Post ID:</b> ${postId}\n<b>Result:</b> ${approved ? '✅ Approved' : '❌ Rejected'}\n${reviewMessage ? `<b>Message:</b> ${reviewMessage}` : ''}`;
    await telegramService.sendNotification(reviewNotifyMsg);

    // If approved, kick off the scheduled jobs by unpausing them (polling will pick them up)
    if (approved) {
      const variants = await PostVariant.find({ postId: post._id });
      for (const variant of variants) {
        variant.status = 'scheduled';
        await variant.save();

        const sp = await ScheduledPost.findOne({ postVariantId: variant._id });
        if (sp && sp.status === 'paused') {
          sp.status = 'pending';
          await sp.save();
        }
      }
    }

    res.json({ message: `Post ${approved ? 'approved' : 'rejected'} successfully`, post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  getCalendarPosts,
  reviewPost
};
