const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateCaption = async (topic, tone, platform) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Write a ${tone} social media caption about ${topic} for ${platform}. 
    Include relevant hashtags. 
    Make it engaging and platform-appropriate.
    If the platform is 'x' or 'twitter', keep it under 280 characters.
    Only return the caption text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini generateCaption error:', error);
    throw new Error('Failed to generate caption with AI');
  }
};

const analyzeSentiment = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze the sentiment of the following text: "${text}". 
    Return a JSON object with two fields:
    - sentiment: (either "positive", "negative", or "neutral")
    - score: (a number from -1 to 1 representing the sentiment intensity)
    Only return the JSON object.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resultText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      return JSON.parse(resultText);
    } catch (parseError) {
      console.error('JSON parse error on sentiment result:', resultText);
      return { sentiment: 'neutral', score: 0 };
    }
  } catch (error) {
    console.error('Gemini analyzeSentiment error:', error);
    throw new Error('Failed to analyze sentiment with AI');
  }
};

const generateHashtags = async (topic) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate 5-10 trending and relevant hashtags for the topic: "${topic}". 
    Only return the hashtags separated by spaces.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Gemini generateHashtags error:', error);
    return '#content #socialmedia';
  }
};

module.exports = {
  generateCaption,
  analyzeSentiment,
  generateHashtags
};
