import { Router } from 'express';
import {
  searchUsers,
  getSuggestedUsers,
  getUserProfile,
  toggleFollow,
  getPendingRequests,
  acceptFollowRequest,
  rejectFollowRequest,
  getFollowers,
  getFollowing,
} from '../controllers/userController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

router.get('/search', authenticate, searchUsers);
router.get('/suggested', authenticate, getSuggestedUsers);
router.get('/requests/pending', authenticate, getPendingRequests);
router.post('/requests/:id/accept', authenticate, acceptFollowRequest);
router.post('/requests/:id/reject', authenticate, rejectFollowRequest);
router.get('/:username', optionalAuthenticate, getUserProfile);
router.post('/:id/follow', authenticate, toggleFollow);
router.get('/:id/followers', optionalAuthenticate, getFollowers);
router.get('/:id/following', optionalAuthenticate, getFollowing);

export default router;

