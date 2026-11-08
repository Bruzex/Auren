import { Router } from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markConversationAsSeen,
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.get('/', getConversations);
router.get('/user/:userId', getOrCreateConversation);
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', upload.single('media'), sendMessage);
router.put('/:conversationId/seen', markConversationAsSeen);

export default router;

