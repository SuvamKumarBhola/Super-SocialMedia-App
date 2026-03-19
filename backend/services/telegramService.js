const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Sends a notification message to the configured Telegram chat.
 * @param {string} message - The message to send.
 */
const sendNotification = async (message) => {
  if (!BOT_TOKEN || !CHAT_ID || CHAT_ID === 'YOUR_CHAT_ID_HERE') {
    console.warn('[TelegramService] Configuration missing or incomplete. Skipping notification.');
    return { success: false, error: 'Configuration missing' };
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });

    if (response.data.ok) {
      console.log('[TelegramService] Notification sent successfully.');
      return { success: true };
    } else {
      console.error('[TelegramService] Failed to send notification:', response.data.description);
      return { success: false, error: response.data.description };
    }
  } catch (error) {
    console.error('[TelegramService] Error sending notification:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Sends media (photo or video) to the configured Telegram chat.
 * @param {string} filePath - Path to the local file.
 * @param {string} caption - The caption for the media.
 * @param {string} type - 'image' or 'video'.
 */
const sendMedia = async (filePath, caption, type = 'image') => {
  if (!BOT_TOKEN || !CHAT_ID || CHAT_ID === 'YOUR_CHAT_ID_HERE') {
    console.warn('[TelegramService] Configuration missing or incomplete. Skipping media notification.');
    return { success: false, error: 'Configuration missing' };
  }

  try {
    const isVideo = type === 'video';
    const method = isVideo ? 'sendVideo' : 'sendPhoto';
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;

    const form = new FormData();
    form.append('chat_id', CHAT_ID);
    form.append('caption', caption);
    form.append('parse_mode', 'HTML');
    form.append(isVideo ? 'video' : 'photo', fs.createReadStream(filePath));

    const response = await axios.post(url, form, {
      headers: form.getHeaders()
    });

    if (response.data.ok) {
      console.log('[TelegramService] Media notification sent successfully.');
      return { success: true };
    } else {
      console.error('[TelegramService] Failed to send media:', response.data.description);
      return { success: false, error: response.data.description };
    }
  } catch (error) {
    console.error('[TelegramService] Error sending media:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendNotification,
  sendMedia
};
