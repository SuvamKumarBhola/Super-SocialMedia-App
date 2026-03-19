const express = require('express');
const router = express.Router();
const { protect: authMiddleware } = require('../middleware/authMiddleware');
const { createCampaign, getCampaigns, getCampaignAnalytics } = require('../controllers/campaignController');

router.use(authMiddleware);

router.post('/', createCampaign);
router.get('/', getCampaigns);
router.get('/:id/analytics', getCampaignAnalytics);

module.exports = router;
