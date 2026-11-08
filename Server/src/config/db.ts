import mongoose from 'mongoose';
import { ENV } from './environment.js';
import { logger } from '../utils/logger.js';

export async function connectDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);
    
    const conn = await mongoose.connect(ENV.MONGO_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting reconnection...');
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    // Don't exit immediately in dev if mongo isn't started yet, allowing server to boot with notice
    if (ENV.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

