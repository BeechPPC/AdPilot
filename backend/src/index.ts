import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import googleAdsAuthRoutes from './routes/googleAdsAuth';
import googleAdsRoutes from './routes/googleAds';
import tierRoutes from './routes/tier';
import aiChatRoutes from './routes/aiChat';
import agentRoutes from './routes/agent';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use('/api/auth/google', googleAdsAuthRoutes);
app.use('/api/google-ads', googleAdsRoutes);
app.use('/api/tier', tierRoutes);
app.use('/api/ai', aiChatRoutes);
app.use('/api/agent', agentRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 