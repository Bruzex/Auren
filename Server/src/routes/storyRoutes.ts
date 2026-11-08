import { Router } from 'express';
import {
  createStory,
  getStoriesFeed,
  getUserStories,
  viewStory,
  deleteStory,
} from '../controllers/storyController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/', authenticate, upload.single('media'), createStory);
router.get('/feed', authenticate, getStoriesFeed);
router.get('/user/:userId', optionalAuthenticate, getUserStories);
router.post('/:id/view', authenticate, viewStory);
router.delete('/:id', authenticate, deleteStory);

export default router;

