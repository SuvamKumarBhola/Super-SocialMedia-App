const mongoose = require('mongoose');
require('dotenv').config();
const Analytics = require('./models/Analytics');
const SocialAccount = require('./models/SocialAccount');
const Post = require('./models/Post');
const PostVariant = require('./models/PostVariant');
const PostAnalytics = require('./models/PostAnalytics');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        const accounts = await SocialAccount.find();
        if (accounts.length === 0) {
            console.log('No social accounts found. Please connect some first.');
            process.exit(0);
        }

        console.log(`Found ${accounts.length} accounts. Seeding 14 days of data for each...`);

        // Clear existing analytics to avoid duplicates/conflicts
        await Analytics.deleteMany({});
        await PostAnalytics.deleteMany({});

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        for (const account of accounts) {
            console.log(`Seeding for account: ${account.platform} (${account.profileData?.username || account._id})`);
            let baseFollowers = Math.floor(Math.random() * 5000) + 1000;
            
            for (let i = 14; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);

                // Grow followers slightly each day
                baseFollowers += Math.floor(Math.random() * 50);
                
                const impressions = Math.floor(baseFollowers * (Math.random() * 2 + 1));
                const engagement = Math.floor(impressions * (Math.random() * 0.1));
                const reach = Math.floor(impressions * 0.8);

                await Analytics.create({
                    socialAccountId: account._id,
                    date,
                    followers: baseFollowers,
                    impressions,
                    engagement,
                    reach,
                    likes: Math.floor(engagement * 0.7),
                    views: account.platform === 'youtube' || account.platform === 'instagram' ? Math.floor(impressions * 0.5) : 0
                });
            }
        }

        // Seed Post Analytics for existing variants
        const variants = await PostVariant.find();
        for (const variant of variants) {
            await PostAnalytics.create({
                postVariantId: variant._id,
                metrics: {
                    likes: Math.floor(Math.random() * 100),
                    shares: Math.floor(Math.random() * 20),
                    comments: Math.floor(Math.random() * 15),
                    impressions: Math.floor(Math.random() * 1000) + 100,
                    clicks: Math.floor(Math.random() * 50)
                }
            });
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();
