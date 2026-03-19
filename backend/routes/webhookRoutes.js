const express = require('express');
const router = express.Router();
const { handleMetaWebhook, handleXWebhook } = require('../controllers/webhookController');

// Open endpoints (no auth middleware because APIs call these)
router.get('/meta', handleMetaWebhook); // For verification
router.post('/meta', handleMetaWebhook); // For receiving payloads

router.get('/x', handleXWebhook); // For CRC
router.post('/x', handleXWebhook); // For receiving payloads

module.exports = router;
