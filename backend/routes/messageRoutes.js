import { Router } from 'express';
import {
  sendMessage,
  getMessagesByConversation,
  getMyConversations,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', getMyConversations);
router.post('/', sendMessage);
router.get('/:conversationId', getMessagesByConversation);

export default router;

