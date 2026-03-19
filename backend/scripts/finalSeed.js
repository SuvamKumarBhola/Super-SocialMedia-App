const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('./models/User');
const Organization = require('./models/Organization');
const SocialAccount = require('./models/SocialAccount');
const Analytics = require('./models/Analytics');
const PostAnalytics = require('./models/PostAnalytics');
const PostVariant = require('./models/PostVariant');
const Post = require('./models/Post');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for final comprehensive seed...');

        // 1. Ensure Admin User exists
        let admin = await User.findOne({ email: 'admin@example.com' });
        if (!admin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            admin = await User.create({
                name: 'System Admin',
                email: 'admin@example.com',
                password: hashedPassword
            });
            console.log('Admin user created.');
        }

        // 2. Ensure Organization exists
        let org = await Organization.findOne({ owner: admin._id });
        if (!org) {
            org = await Organization.create({
                name: 'Admin Workspace',
                owner: admin._id,
                members: [{ user: admin._id, role: 'admin' }]
            });
            admin.organizations.push(org._id);
            await admin.save();
            console.log('Admin organization created.');
        }

        // 3. Create Mock Social Accounts
        await SocialAccount.deleteMany({ organizationId: org._id });
        const platforms = ['instagram', 'facebook', 'x', 'youtube'];
        const accounts = [];
        
        for (const platform of platforms) {
            const acc = await SocialAccount.create({
                organizationId: org._id,
                platform,
                platformUserId: `mock_${platform}_id`,
                accessToken: `mock_token_${platform}`,
                profileData: {
                    username: `${platform}_pro`,
                    avatar: `https://ui-avatars.com/api/?name=${platform}&background=random`
                }
            });
            accounts.push(acc);
        }
        console.log(`Created ${accounts.length} mock accounts for Admin.`);

        // 4. Seed Analytics for these accounts
        await Analytics.deleteMany({ socialAccountId: { $in: accounts.map(a => a._id) } });
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        for (const account of accounts) {
            let followers = 1500 + Math.floor(Math.random() * 1000);
            for (let i = 14; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                followers += Math.floor(Math.random() * 20);
                
                const impressions = Math.floor(followers * (1.5 + Math.random()));
                const engagement = Math.floor(impressions * 0.05 * (0.8 + Math.random() * 0.4));

                await Analytics.create({
                    socialAccountId: account._id,
                    date,
                    followers,
                    impressions,
                    engagement,
                    reach: Math.floor(impressions * 0.7)
                });
            }
        }
        console.log('Seeded 14 days of analytics for Admin accounts.');

        // 5. Seed a few fake content types for Content Type Comparison
        // We'll just manually use the existing logic in analyticsController which looks at PostVariant status 'published'
        // So we need some published posts
        await Post.deleteMany({ organizationId: org._id });
        await PostVariant.deleteMany({}); // Warning: deletes all variants
        
        const contentTypes = ['image', 'video', 'carousel', 'text'];
        for (let i = 0; i < 10; i++) {
            const type = contentTypes[i % contentTypes.length];
            const post = await Post.create({
                organizationId: org._id,
                userId: admin._id,
                content: { text: `Post number ${i}` },
                status: 'published'
            });

            const variant = await PostVariant.create({
                postId: post._id,
                socialAccountId: accounts[i % accounts.length]._id,
                platform: accounts[i % accounts.length].platform,
                content: { text: `Variant ${i}`, media: [{ type, url: 'https://via.placeholder.com/150' }] },
                status: 'published'
            });

            await PostAnalytics.create({
                postVariantId: variant._id,
                metrics: {
                    likes: Math.floor(Math.random() * 100),
                    impressions: Math.floor(Math.random() * 1000) + 200,
                    clicks: Math.floor(Math.random() * 50)
                }
            });
        }
        console.log('Seeded mock posts and post analytics for comparison charts.');

        console.log('Final Seed Completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Final Seed failed:', err);
        process.exit(1);
    }
};

seed();
