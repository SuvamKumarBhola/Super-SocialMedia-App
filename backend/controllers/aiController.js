const { generateCaption, analyzeSentiment, generateHashtags } = require('../services/aiService');
const { getGrowthAdvice, suggestPostIdea } = require('../services/aiAdvisorService');

const createCaption = async (req, res) => {
  try {
    const { topic, tone, platform } = req.body;
    
    if (!topic || !tone) {
      return res.status(400).json({ message: 'Topic and tone are required.' });
    }

    const caption = await generateCaption(topic, tone, platform || 'general');
    res.json({ caption });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSentiment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
       return res.status(400).json({ message: 'Text is required.' });
    }

    const result = await analyzeSentiment(text);
    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const suggestHashtags = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required.' });
    }
    const hashtags = await generateHashtags(topic);
    res.json({ hashtags });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdvice = async (req, res) => {
  try {
    const { data, type } = req.body;
    const advice = await getGrowthAdvice(data, type || 'general');
    res.json({ advice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPostSuggestion = async (req, res) => {
  try {
    const { campaignData } = req.body;
    const suggestion = await suggestPostIdea(campaignData);
    res.json({ suggestion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCaption,
  getSentiment,
  suggestHashtags,
  getAdvice,
  getPostSuggestion
};
