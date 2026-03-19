require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const orgRoutes = require('./routes/orgRoutes');
const socialRoutes = require('./routes/socialRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const postRoutes = require('./routes/postRoutes');
const inboxRoutes = require('./routes/inboxRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const aiRoutes = require('./routes/aiRoutes');
const activityRoutes = require('./routes/activityRoutes');
const campaignRoutes = require('./routes/campaignRoutes');

// Initialize background workers
require('./workers/analyticsWorker');
require('./workers/postSchedulerWorker');
require('./workers/telegramBotWorker');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Creator OS API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/campaigns', campaignRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});
