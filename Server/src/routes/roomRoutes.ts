import { Router } from 'express';
import {
  createRoom,
  joinRoom,
  getRoomDetails,
  getRecentRooms,
} from '../controllers/roomController.js';
import { optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', optionalAuthenticate, createRoom);
router.post('/join', optionalAuthenticate, joinRoom);
router.get('/', optionalAuthenticate, getRecentRooms);
router.get('/:code', optionalAuthenticate, getRoomDetails);

export default router;

