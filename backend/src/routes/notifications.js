import { Router } from 'express';
import { db } from '../data/db.js';

const router = Router();

// GET /api/notifications
router.get('/', (req, res) => {
  res.json({ success: true, data: db.getNotifications() });
});

// PUT /api/notifications/mark-read
router.put('/mark-read', (req, res) => {
  const updated = db.markAllNotificationsRead();
  res.json({ success: true, data: updated });
});

export default router;

