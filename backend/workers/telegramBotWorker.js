const axios = require('axios');
const Post = require('../models/Post');
const PostVariant = require('../models/PostVariant');
const ScheduledPost = require('../models/ScheduledPost');
const SocialAccount = require('../models/SocialAccount');
const ActivityLog = require('../models/ActivityLog');
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let lastUpdateId = 0;

/**
 * Polls Telegram for updates and processes them.
 */
const pollUpdates = async () => {
  if (!BOT_TOKEN) return;

  try {
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`, {
      params: {
        offset: lastUpdateId + 1,
        timeout: 30
      }
    });

    if (response.data.ok && response.data.result.length > 0) {
      for (const update of response.data.result) {
        lastUpdateId = update.update_id;
        await processUpdate(update);
      }
    }
  } catch (error) {
    if (error.code !== 'ECONNABORTED') {
      console.error('[TelegramBotWorker] Error polling updates:', error.message);
    }
  } finally {
    // Poll again immediately
    setTimeout(pollUpdates, 1000);
  }
};

/**
 * Processes a single Telegram update.
 */
const processUpdate = async (update) => {
  if (update.message && update.message.text) {
    const { text, chat, message_id } = update.message;
    
    // Only respond to the authorized user (simplification for the hackathon)
    if (CHAT_ID && chat.id.toString() !== CHAT_ID) {
      console.warn(`[TelegramBotWorker] Unauthorized access attempt from ${chat.id}`);
      // Send a one-time message explaining how to authorize
      await sendMsg(chat.id, `🔒 <b>Unauthorized Access</b>\n\nYour Chat ID is: <code>${chat.id}</code>\n\nTo authorize this ID, update the <code>TELEGRAM_CHAT_ID</code> in your <code>.env</code> file.`);
      return;
    }

    const command = text.split(' ')[0].toLowerCase();
    // ... rest of the logic ...

    switch (command) {
      case '/start':
      case '/help':
        await sendMsg(chat.id, `👋 <b>Creator OS Bot</b>\n\nI can help you manage your social media posts.\n\n<b>Commands:</b>\n/pending - List posts waiting for approval\n/help - Show this message`);
        break;

      case '/pending':
        await handlePendingCommand(chat.id);
        break;

      case '/stats':
        await handleStatsCommand(chat.id);
        break;

      default:
        // Handle callback-like responses if we use commands for actions
        if (command.startsWith('/approve_') || command.startsWith('/reject_')) {
            const [action, postId] = command.substring(1).split('_');
            await handleReviewAction(chat.id, postId, action === 'approve');
        } else {
            // await sendMsg(chat.id, "❓ Unknown command. Try /help.");
        }
    }
  } else if (update.callback_query) {
    // Handle inline buttons
    const { data, message } = update.callback_query;
    const [action, postId] = data.split(':');
    
    await handleReviewAction(message.chat.id, postId, action === 'approve');
    
    // Answer the callback query to remove the loading state on the button
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      callback_query_id: update.callback_query.id
    });
  }
};

const handlePendingCommand = async (chatId) => {
  try {
    const pendingPosts = await Post.find({ approvalStatus: 'pending' }).limit(5);

    if (pendingPosts.length === 0) {
      return await sendMsg(chatId, "✅ No posts currently pending approval.");
    }

    for (const post of pendingPosts) {
      const variants = await PostVariant.find({ postId: post._id });
      const platforms = variants.map(v => v.platform).join(', ');
      
      const message = `📝 <b>Pending Post</b>\n\n<b>ID:</b> <code>${post._id}</code>\n<b>Platforms:</b> ${platforms}\n<b>Caption:</b>\n<i>${post.baseCaption.substring(0, 100)}${post.baseCaption.length > 100 ? '...' : ''}</i>`;
      
      const keyboard = {
        inline_keyboard: [[
          { text: '✅ Approve', callback_data: `approve:${post._id}` },
          { text: '❌ Reject', callback_data: `reject:${post._id}` }
        ]]
      };

      await sendMsg(chatId, message, keyboard);
    }
  } catch (error) {
    console.error('[TelegramBotWorker] Error fetching pending posts:', error.message);
    await sendMsg(chatId, "❌ Error fetching pending posts.");
  }
};

const handleReviewAction = async (chatId, postId, approved) => {
  try {
    const post = await Post.findById(postId);
    if (!post) return await sendMsg(chatId, "❌ Post not found.");
    if (post.approvalStatus !== 'pending') return await sendMsg(chatId, "⚠️ This post has already been reviewed.");

    // Update Post status (mirroring reviewPost in postController.js)
    post.approvalStatus = approved ? 'approved' : 'rejected';
    post.status = approved ? 'scheduled' : 'draft';
    post.reviewMessage = 'Reviewed via Telegram';
    await post.save();

    // Log the action (mocking req.user.id with a system ID or the chat ID)
    await ActivityLog.create({
      organizationId: post.organizationId,
      userId: post.createdBy, // In a real app, we'd map Telegram User to internal User
      action: approved ? 'approved_post' : 'rejected_post',
      resourceType: 'Post',
      resourceId: post._id,
      metadata: { source: 'Telegram' }
    });

    if (approved) {
      const variants = await PostVariant.find({ postId: post._id });
      for (const variant of variants) {
        variant.status = 'scheduled';
        await variant.save();

        const sp = await ScheduledPost.findOne({ postVariantId: variant._id });
        if (sp && sp.status === 'paused') {
          sp.status = 'pending';
          await sp.save();
          // Note: In a real system, we'd need to re-add to BullMQ queue here if we were using it consistently.
          // Since BullMQ is partially disabled/mocked in the controller, we'll keep it simple.
          console.log(`[TelegramBotWorker] Post ${post._id} variant ${variant._id} unpaused.`);
        }
      }
    }

    await sendMsg(chatId, `🎉 Post <code>${postId}</code> has been <b>${approved ? 'Approved' : 'Rejected'}</b>.`);
  } catch (error) {
    console.error('[TelegramBotWorker] Error processing review:', error.message);
    await sendMsg(chatId, `❌ FAILED to process review for ${postId}.`);
  }
};

const handleStatsCommand = async (chatId) => {
  try {
    const accounts = await SocialAccount.find();
    if (accounts.length === 0) {
      return await sendMsg(chatId, "📉 No social accounts connected yet.");
    }

    let statsMsg = "📊 <b>Current Stats Overview</b>\n\n";
    
    for (const acc of accounts) {
        // Fetch latest analytics for this account
        const latestStats = await require('../models/Analytics').findOne({ socialAccountId: acc._id }).sort({ date: -1 });
        
        if (latestStats) {
            statsMsg += `<b>${acc.platform.toUpperCase()} (@${acc.profileData.username})</b>\n`;
            statsMsg += `👥 Followers: ${latestStats.followers.toLocaleString()}\n`;
            statsMsg += `📈 Reach: ${latestStats.reach.toLocaleString()}\n`;
            statsMsg += `✨ Engagement: ${latestStats.engagement.toLocaleString()}\n\n`;
        }
    }

    await sendMsg(chatId, statsMsg);
  } catch (error) {
    console.error('[TelegramBotWorker] Error fetching stats:', error.message);
    await sendMsg(chatId, "❌ Error fetching statistics.");
  }
};

const sendMsg = async (chatId, text, reply_markup = null) => {
  try {
    const payload = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML'
    };
    if (reply_markup) {
      payload.reply_markup = reply_markup;
    }
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, payload);
  } catch (error) {
    console.error('[TelegramBotWorker] Error sending message:', error.response?.data || error.message);
  }
};

// Auto-start polling if not in test
if (process.env.NODE_ENV !== 'test') {
  console.log('[TelegramBotWorker] Starting Telegram Bot polling...');
  pollUpdates();
}

module.exports = { pollUpdates };
