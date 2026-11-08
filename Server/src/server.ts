import http from 'http';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { initSocketServer } from './sockets/index.js';
import { ENV } from './config/environment.js';
import { logger } from './utils/logger.js';

async function bootstrap(): Promise<void> {
  // Connect to MongoDB
  await connectDB();

  // Create Express app
  const app = createApp();

  // Create HTTP server
  const httpServer = http.createServer(app);

  // Initialize Socket.io server
  initSocketServer(httpServer);

  // Start listening
  const server = httpServer.listen(ENV.PORT, () => {
    logger.info(`✨ Auren API Server running at http://localhost:${ENV.PORT}`);
    logger.info(`🔌 Real-time Socket.io active on ws://localhost:${ENV.PORT}`);
    logger.info(`📡 Environment: ${ENV.NODE_ENV}`);
    logger.info(`🌐 Allowed Client URL: ${ENV.CLIENT_URL}`);
  });

  // Graceful shutdown
  const gracefulShutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });

    // Force close after 10s
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap error:', err);
  process.exit(1);
});

