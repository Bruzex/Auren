import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import chatRoutes from './chatRoutes.js';
import storyRoutes from './storyRoutes.js';
import roomRoutes from './roomRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/chats', chatRoutes);
router.use('/stories', storyRoutes);
router.use('/rooms', roomRoutes);
router.use('/notifications', notificationRoutes);

export default router;

