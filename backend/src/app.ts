import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { globalLimiter, loginLimiter } from './middleware/rateLimiter';
import { validateAuthConfig } from './config/auth';
import googleAdsAuthRoutes from './routes/googleAdsAuth';
import googleAdsRoutes from './routes/googleAds';
import tierRoutes from './routes/tier';
import aiChatRoutes from './routes/aiChat';
import agentRoutes from './routes/agent';
import adminAuthRoutes from './routes/adminAuth';

// Validate auth configuration (warns instead of crashing)
validateAuthConfig();

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// Rate limiting
app.use(globalLimiter);

// CORS
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (proxied requests, server-to-server, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV !== 'production') {
      // In development, allow all origins
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));

// Body parsing with size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use('/api/auth/google', googleAdsAuthRoutes);
app.use('/api/auth', loginLimiter, adminAuthRoutes);
app.use('/api/google-ads', googleAdsRoutes);
app.use('/api/tier', tierRoutes);
app.use('/api/ai', aiChatRoutes);
app.use('/api/agent', agentRoutes);

// Error handling
app.use(errorHandler);

export default app;
