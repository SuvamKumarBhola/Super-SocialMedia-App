const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes campaign and global performance data to provide actionable growth advice.
 */
const getGrowthAdvice = async (performanceData, contextType = 'general') => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `As an expert social media growth consultant, analyze this performance data and provide 3-4 actionable growth recommendations.
    
    Data: ${JSON.stringify(performanceData)}
    Context: ${contextType}

    Keep recommendations concise, professional, and highly specific to the numbers seen. 
    Format the response as a JSON array of strings.
    Only return the JSON array.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resultText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      return JSON.parse(resultText);
    } catch (parseError) {
      console.error('JSON parse error on growth advice:', resultText);
      return ["Focus on consistency across all platforms.", "Engage more with your top commenters.", "Try experimenting with different content formats."];
    }
  } catch (error) {
    console.error('Gemini getGrowthAdvice error:', error);
    return ["AI Consultant is currently offline. Focus on high-quality content."];
  }
};

/**
 * Suggests a specific post idea for a campaign based on its performance.
 */
const suggestPostIdea = async (campaignData) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Based on the following campaign data, suggest ONE highly engaging post idea (caption and suggested media type) that would perform well.
    
    Campaign: ${JSON.stringify(campaignData)}

    Return a JSON object with:
    - title: (Short title of the idea)
    - caption: (The actual suggested caption)
    - mediaType: (image, video, or carousel)
    - reasoning: (Why this idea works for this campaign)
    
    Only return the JSON object.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resultText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(resultText);
  } catch (error) {
    console.error('Gemini suggestPostIdea error:', error);
    return null;
  }
};

module.exports = {
  getGrowthAdvice,
  suggestPostIdea
};
