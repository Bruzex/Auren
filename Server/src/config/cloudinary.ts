import { v2 as cloudinary } from 'cloudinary';
import { ENV } from './environment.js';
import { logger } from '../utils/logger.js';

if (ENV.CLOUDINARY.IS_CONFIGURED) {
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY.CLOUD_NAME,
    api_key: ENV.CLOUDINARY.API_KEY,
    api_secret: ENV.CLOUDINARY.API_SECRET,
    secure: true,
  });
  logger.info('Cloudinary configured successfully');
} else {
  logger.info('Cloudinary not configured. Falling back to local storage.');
}

export { cloudinary };

