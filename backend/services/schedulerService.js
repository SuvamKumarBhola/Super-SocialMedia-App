const PostVariant = require('../models/PostVariant');
const Post = require('../models/Post');
const ScheduledPost = require('../models/ScheduledPost');
const telegramService = require('./telegramService');
const { generateMockPostAnalytics } = require('./mockAnalyticsService');

// Import Adapters
const adapters = {
  instagram: require('./platformAdapters/instagram.service'),
  facebook: require('./platformAdapters/facebook.service'),
  x: require('./platformAdapters/x.service'),
  linkedin: require('./platformAdapters/linkedin.service'),
  youtube: require('./platformAdapters/youtube.service'),
};

/**
 * Polling function to process due scheduled posts
 */
const processScheduledPosts = async () => {
  const now = new Date();
  console.log(`[Scheduler] Checking for due posts at ${now.toISOString()}...`);

  try {
    // Find all pending scheduled posts that are due
    const scheduledPosts = await ScheduledPost.find({
      status: 'pending',
      scheduledTime: { $lte: now }
    }).populate({
      path: 'postVariantId',
      populate: { path: 'postId' }
    });

    if (scheduledPosts.length === 0) {
      return;
    }

    console.log(`[Scheduler] Found ${scheduledPosts.length} due posts.`);

    for (const sp of scheduledPosts) {
      await processSinglePost(sp);
    }
  } catch (error) {
    console.error('[Scheduler] Error in processScheduledPosts:', error.message);
  }
};

/**
 * Process a single scheduled post
 * @param {Object} sp ScheduledPost document
 */
const processSinglePost = async (sp) => {
  console.log(`[Scheduler] Processing scheduled post ID: ${sp._id}`);

  try {
    // Mark as processing to avoid duplicate runs
    sp.status = 'processing';
    await sp.save();

    const variant = sp.postVariantId;
    if (!variant) throw new Error('PostVariant not found');

    const post = variant.postId;
    if (!post) throw new Error('Post not found');

    const platform = variant.platform;
    const adapter = adapters[platform];
    if (!adapter) throw new Error(`No adapter found for platform: ${platform}`);

    // Attempt to publish
    console.log(`[Scheduler] Publishing to ${platform}...`);
    const result = await adapter.publish(variant, post.media);

    if (result.success) {
      variant.status = 'published';
      variant.platformPostId = result.platformPostId;
      await variant.save();

      sp.status = 'completed';
      await sp.save();

      // Check if all variants for this post are published to update the main Post status
      const allVariants = await PostVariant.find({ postId: post._id });
      const allDone = allVariants.every(v => v.status === 'published' || v.status === 'failed');
      
      if (allDone) {
        post.status = 'published';
        await post.save();
      }

      // Generate Mock Analytics Pulse
      generateMockPostAnalytics(variant._id);

      // Notify Telegram
      const pubSuccessMsg = `⏰ <b>Scheduled Post Published</b>\n\n<b>Platform:</b> ${platform}\n<b>Post ID:</b> ${result.platformPostId}`;
      await telegramService.sendNotification(pubSuccessMsg);

      console.log(`[Scheduler] Successfully published post ${sp._id} to ${platform}`);

    } else {
      throw new Error(result.error || 'Unknown publish error');
    }

  } catch (error) {
    console.error(`[Scheduler] Failed to process ${sp._id}:`, error.message);
    
    try {
      sp.status = 'failed';
      sp.errorLogs.push(error.message);
      await sp.save();

      if (sp.postVariantId) {
        sp.postVariantId.status = 'failed';
        await sp.postVariantId.save();
      }
      
      // Notify Telegram
      const pubFailMsg = `❌ <b>Scheduled Publishing Failed</b>\n\n<b>Post ID:</b> ${sp._id}\n<b>Error:</b> ${error.message}`;
      await telegramService.sendNotification(pubFailMsg);

    } catch (e) {
      console.error('[Scheduler] Failed to save error state', e);
    }
  }
};

module.exports = {
  processScheduledPosts
};
