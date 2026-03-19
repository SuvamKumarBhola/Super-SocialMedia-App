const express = require('express');
const router = express.Router();
const { connectPlatform, callbackPlatform, getConnectedAccounts, disconnectPlatform, connectPlatformManual } = require('../controllers/socialController');
const { protect } = require('../middleware/authMiddleware');

router.get('/connect/:platform', protect, connectPlatform);
router.post('/callback/:platform', protect, callbackPlatform);
router.post('/connect-manual', protect, connectPlatformManual);
router.get('/accounts/:orgId', protect, getConnectedAccounts);
router.delete('/disconnect/:accountId', protect, disconnectPlatform);

module.exports = router;
