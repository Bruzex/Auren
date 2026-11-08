import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { ENV } from './config/environment.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

export function createApp(): Application {
  const app: Application = express();

  // Helmet with permissive crossOriginResourcePolicy for served uploads
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS configuration
  const allowedOrigins = [
    ENV.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in dev to avoid friction
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request logging
  app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Body parsers
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use(cookieParser());

  // Serve static uploads
  app.use('/uploads', express.static(ENV.UPLOADS_DIR));

  // Mount API routes
  app.use('/api', apiRoutes);

  // Root welcome route
  app.get('/', (_req, res) => {
    res.json({
      name: 'Auren Social Backend API',
      version: '1.0.0',
      status: 'active',
      docs: '/api/health',
    });
  });

  // Catch 404 and forward to error handler
  app.use(notFoundHandler);

  // Central Error Handler
  app.use(errorHandler);

  return app;
}

