const express = require('express');
const router = express.Router();
const { getGlobalStats, getChartData, getPlatformComparison, getContentTypeComparison } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:orgId/global', protect, getGlobalStats);
router.get('/:orgId/charts', protect, getChartData);
router.get('/:orgId/comparison', protect, getPlatformComparison);
router.get('/:orgId/content-type', protect, getContentTypeComparison);

module.exports = router;
