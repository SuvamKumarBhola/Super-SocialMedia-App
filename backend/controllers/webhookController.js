const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const handleMetaWebhook = async (req, res) => {
  try {
    // 1. Verify Meta Hub Challenge (for setup)
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.META_WEBHOOK_VERIFY_TOKEN) {
      console.log('Verifying Meta Webhook');
      return res.status(200).send(req.query['hub.challenge']);
    }

    // 2. Process incoming payload
    const body = req.body;
    
    // Check if it's an event from a Page subscription
    if (body.object === 'page' || body.object === 'instagram') {
      
      for (const entry of body.entry) {
        // The Meta Page ID or IG Account ID receiving the message
        const accountId = entry.id; 
        
        // Handle incoming messages
        if (entry.messaging) {
          for (const event of entry.messaging) {
            
            if (event.message && !event.message.is_echo) {
              const senderId = event.sender.id;
              const content = event.message.text;
              
              console.log(`Received Meta DM from ${senderId}: ${content}`);

              // TODO: 1. Lookup the local Organization/SocialAccount by the Meta `accountId`
              // const socialAccount = await SocialAccount.findOne({ 'profileData.id': accountId });
              
              // TODO: 2. Find or create the Conversation thread
              // const conv = await Conversation.findOneAndUpdate( ... )

              // TODO: 3. Insert the new Message
              // await Message.create( ... )
            }
          }
        }
        
        // Handle incoming comments
        if (entry.changes) {
            // Processing for Instagram/FB Feed Comments
        }
      }
      
      // Return a '200 OK' response to all requests
      return res.status(200).send('EVENT_RECEIVED');
    } else {
      // Return a '404 Not Found' if event is not from a page subscription
      return res.sendStatus(404);
    }
  } catch (error) {
    console.error('Meta Webhook Error:', error);
    res.status(500).send('Internal Server Error');
  }
};

const handleXWebhook = async (req, res) => {
    // Boilerplate for X/Twitter Account Activity API
    // 1. Handle CRC (Challenge-Response Checks) with HMAC SHA-256
    // 2. Parse direct_message_events or tweet_create_events
    // 3. Map to local Conversation/Message models
    res.status(200).send('X_EVENT_RECEIVED');
}

module.exports = {
  handleMetaWebhook,
  handleXWebhook
};
