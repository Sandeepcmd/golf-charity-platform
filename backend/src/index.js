import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import scoreRoutes from './routes/score.routes.js';
import charityRoutes from './routes/charity.routes.js';
import drawRoutes from './routes/draw.routes.js';
import adminRoutes from './routes/admin.routes.js';
import webhookRoutes from './routes/webhook.routes.js';

import { errorHandler } from './middleware/error.middleware.js';
import { scheduledJobs } from './services/scheduler.service.js';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Webhook route needs raw body - must be before express.json()
app.use('/api/webhooks', webhookRoutes);

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Start scheduled jobs
scheduledJobs();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
