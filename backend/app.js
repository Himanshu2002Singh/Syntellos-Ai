import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';
import { env } from './config/env.js';
import { initDatabase } from './config/db.js';
import { initMailer } from './config/mailer.js';
import { runSeed } from './scripts/seed.js';
import { logger } from './utils/logger.js';

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS Configuration
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// HTTP Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiters
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const leadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many submissions received. Please wait a few minutes before submitting another brief.',
  },
});

app.use('/api/', publicLimiter);
app.use('/api/leads', leadLimiter);

// Mount API Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Syntellos AI Backend API Server',
    status: 'active',
    health: '/api/health',
  });
});

// 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Bootstrap & Listen
if (env.NODE_ENV !== 'test') {
  async function startServer() {
    try {
      console.log(`
\x1b[36m╔══════════════════════════════════════════════════════════════════════╗
║                   SYNTELLOS AI - MVC BACKEND SERVER                  ║
║         India GTM & Delivery Platform for Global Tech Ecosystem      ║
╚══════════════════════════════════════════════════════════════════════╝\x1b[0m
`);

      const driver = await initDatabase();
      logger.success(`Database ready [Driver: ${driver.toUpperCase()}]`);

      initMailer();
      await runSeed();

      const server = app.listen(env.PORT, () => {
        logger.success(`Server running on port \x1b[32m${env.PORT}\x1b[0m in \x1b[33m${env.NODE_ENV}\x1b[0m mode`);
        console.log(`
\x1b[32m➜\x1b[0m  Local API:       \x1b[36mhttp://localhost:${env.PORT}/api\x1b[0m
\x1b[32m➜\x1b[0m  Health Check:    \x1b[36mhttp://localhost:${env.PORT}/api/health\x1b[0m
\x1b[32m➜\x1b[0m  Admin Email:     \x1b[33m${env.ADMIN_DEFAULT_EMAIL}\x1b[0m
\x1b[32m➜\x1b[0m  Default Pass:    \x1b[33m${env.ADMIN_DEFAULT_PASSWORD}\x1b[0m
`);
      });

      const shutdown = (signal) => {
        logger.info(`Received ${signal}. Shutting down gracefully...`);
        server.close(() => {
          logger.info('HTTP server closed.');
          process.exit(0);
        });
      };

      process.on('SIGTERM', () => shutdown('SIGTERM'));
      process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (err) {
      logger.error('Fatal bootstrap error:', err);
      process.exit(1);
    }
  }

  startServer();
}

export default app;