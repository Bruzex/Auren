import { Router } from 'express';
import {
  createStory,
  getStoriesFeed,
  getUserStories,
  viewStory,
  likeStory,
  getStoryLikes,
  deleteStory,
} from '../controllers/storyController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/', authenticate, upload.single('media'), createStory);
router.get('/feed', authenticate, getStoriesFeed);
router.get('/user/:userId', optionalAuthenticate, getUserStories);
router.post('/:id/view', authenticate, viewStory);
router.post('/:id/like', authenticate, likeStory);
router.get('/:id/likes', authenticate, getStoryLikes);
router.delete('/:id', authenticate, deleteStory);

export default router;

