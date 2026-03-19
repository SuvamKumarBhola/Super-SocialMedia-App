const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:orgId', protect, getLogs);

module.exports = router;
