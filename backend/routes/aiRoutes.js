const express = require('express');
const router = express.Router();
const { createCaption, getSentiment, suggestHashtags, getAdvice, getPostSuggestion } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate-caption', protect, createCaption);
router.post('/analyze-sentiment', protect, getSentiment);
router.post('/hashtags', protect, suggestHashtags);
router.post('/advice', protect, getAdvice);
router.post('/suggest-post', protect, getPostSuggestion);

module.exports = router;
