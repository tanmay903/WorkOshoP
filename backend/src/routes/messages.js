import { Router } from 'express';
import { db } from '../data/db.js';

const router = Router();

// GET /api/messages
router.get('/', (req, res) => {
  res.json({ success: true, data: db.getConversations() });
});

// POST /api/messages/:convId
router.post('/:convId', (req, res) => {
  const { text, sender } = req.body;
  const newMsg = {
    id: `m-${Date.now()}`,
    sender: sender || 'customer',
    text: text || '',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  db.addMessage(req.params.convId, newMsg);
  res.status(201).json({ success: true, data: newMsg });
});

export default router;

