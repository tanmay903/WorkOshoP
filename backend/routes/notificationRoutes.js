import { Router } from 'express';
import {
  getMyNotifications,
  markAllAsRead,
  markAsRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', getMyNotifications);
router.put('/mark-read', markAllAsRead);
router.put('/:id/read', markAsRead);

export default router;

