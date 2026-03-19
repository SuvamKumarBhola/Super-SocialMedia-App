const SocialAccount = require('../models/SocialAccount');
const axios = require('axios');
const telegramService = require('../services/telegramService');

// Placeholder for actual OAuth redirect generation
const connectPlatform = async (req, res) => {
  const { platform } = req.params;
  const { orgId } = req.query;

  // In a real scenario, you generate an auth URL and redirect the user
  // Facebook: https://www.facebook.com/v16.0/dialog/oauth?client_id=...
  // For this boilerplate, we'll return a mock URL

  const mockAuthUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/accounts?mock_code=12345&platform=${platform}&orgId=${orgId}`;
  res.json({ authUrl: mockAuthUrl });
};

// Placeholder for actual OAuth callback handling
const callbackPlatform = async (req, res) => {
  try {
    const { platform } = req.params;
    const { code, orgId } = req.body;

    let accessToken = `mock_access_token_${Date.now()}`;
    let platformUserId = `user_${Math.floor(Math.random() * 100000)}`;
    let profileData = {
      username: `mock_${platform}_user`,
      avatar: `https://ui-avatars.com/api/?name=${platform}&background=random`
    };

    // Real scenario: exchange `code` for `accessToken` via the platform's API
    if (platform === 'instagram' && process.env.INSTAGRAM_ACCESS_TOKEN) {
      accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
      
      try {
        // Fetch real Instagram profile data
        const response = await axios.get(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
        platformUserId = response.data.id;
        profileData = {
          username: response.data.username,
          avatar: `https://ui-avatars.com/api/?name=${response.data.username}&background=random`
        };
      } catch (apiError) {
        console.error('Instagram API Error:', apiError.response?.data || apiError.message);
        // Fallback to mock if API fails but token exists (might be expired)
      }
    } else if (platform === 'facebook' && process.env.FACEBOOK_ACCESS_TOKEN) {
      accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
      
      try {
        // Fetch real Facebook profile data
        const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,picture&access_token=${accessToken}`);
        platformUserId = response.data.id;
        profileData = {
          username: response.data.name,
          avatar: response.data.picture?.data?.url || `https://ui-avatars.com/api/?name=${response.data.name}&background=random`
        };
      } catch (apiError) {
        console.error('Facebook API Error:', apiError.response?.data || apiError.message);
      }
    }

    const account = await SocialAccount.findOneAndUpdate(
      { organizationId: orgId, platform, platformUserId },
      {
        accessToken,
        profileData
      },
      { upsert: true, new: true }
    );

    // Notify Telegram
    const connectionMsg = `🔗 <b>Account Connected</b>\n\n<b>Platform:</b> ${platform}\n<b>User:</b> ${profileData.username}`;
    await telegramService.sendNotification(connectionMsg);

    res.json({ message: 'Connected successfully', account });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getConnectedAccounts = async (req, res) => {
  try {
    const { orgId } = req.params;
    const accounts = await SocialAccount.find({ organizationId: orgId });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const disconnectPlatform = async (req, res) => {
  try {
    const { accountId } = req.params;
    await SocialAccount.findByIdAndDelete(accountId);
    res.json({ message: 'Account disconnected successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const connectPlatformManual = async (req, res) => {
  try {
    const { platform, username, password, orgId } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    let accessToken = `mock_token_${Math.random().toString(36).substr(2, 9)}`;
    let platformUserId = `manual_${username}`;
    let profileData = {
      username: username,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=random`
    };

    // If Instagram and we have a real token, use it to get real profile
    if (platform === 'instagram' && process.env.INSTAGRAM_ACCESS_TOKEN) {
      accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
      try {
        const response = await axios.get(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
        platformUserId = response.data.id;
        profileData = {
          username: response.data.username,
          avatar: `https://ui-avatars.com/api/?name=${response.data.username}&background=random`
        };
      } catch (apiError) {
        console.error('Instagram API Error (Manual):', apiError.response?.data || apiError.message);
      }
    } else if (platform === 'facebook' && process.env.FACEBOOK_ACCESS_TOKEN) {
      accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
      try {
        const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,picture&access_token=${accessToken}`);
        platformUserId = response.data.id;
        profileData = {
          username: response.data.name,
          avatar: response.data.picture?.data?.url || `https://ui-avatars.com/api/?name=${response.data.name}&background=random`
        };
      } catch (apiError) {
        console.error('Facebook API Error (Manual):', apiError.response?.data || apiError.message);
      }
    }

    const account = await SocialAccount.findOneAndUpdate(
      { organizationId: orgId, platform, platformUserId },
      {
        accessToken,
        profileData
      },
      { upsert: true, new: true }
    );

    // Notify Telegram
    const manualConnectionMsg = `🔗 <b>Account Connected (Manual)</b>\n\n<b>Platform:</b> ${platform}\n<b>User:</b> ${profileData.username}`;
    await telegramService.sendNotification(manualConnectionMsg);

    res.json({ message: 'Connected manually successfully', account });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  connectPlatform,
  callbackPlatform,
  getConnectedAccounts,
  disconnectPlatform,
  connectPlatformManual
};
