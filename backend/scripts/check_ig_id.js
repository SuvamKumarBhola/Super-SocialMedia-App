const axios = require('axios');
require('dotenv').config();

const findIGBusinessAccount = async () => {
  const token = process.env.FACEBOOK_ACCESS_TOKEN;
  try {
    // 1. Get Pages
    const pagesRes = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?access_token=${token}`);
    const pages = pagesRes.data.data;
    
    console.log('Found Pages:', pages.length);

    for (const page of pages) {
      // 2. For each page, check for linked IG Business Account
      try {
        const igRes = await axios.get(`https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${token}`);
        if (igRes.data.instagram_business_account) {
          console.log(`Page: ${page.name} (${page.id}) has IG Business Account: ${igRes.data.instagram_business_account.id}`);
        }
      } catch (e) {
        // console.log(`Page ${page.name} has no IG account or error: ${e.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

findIGBusinessAccount();
