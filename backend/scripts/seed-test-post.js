const mongoose = require('mongoose');
const Post = require('./models/Post');
const PostVariant = require('./models/PostVariant');
const ScheduledPost = require('./models/ScheduledPost');
require('dotenv').config();

const seedTestPost = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const orgId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const post = await Post.create({
      organizationId: orgId,
      createdBy: userId,
      baseCaption: 'This is a test post for Telegram Approval! 🚀 #Hackathon',
      media: [],
      status: 'pending_approval',
      approvalStatus: 'pending'
    });

    const variant = await PostVariant.create({
      postId: post._id,
      platform: 'instagram',
      socialAccountId: new mongoose.Types.ObjectId(),
      caption: post.baseCaption,
      status: 'pending'
    });

    await ScheduledPost.create({
      postVariantId: variant._id,
      scheduledTime: new Date(Date.now() + 3600000), // 1 hour from now
      status: 'paused'
    });

    console.log(`Successfully created pending post: ${post._id}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test post:', error.message);
    process.exit(1);
  }
};

seedTestPost();
