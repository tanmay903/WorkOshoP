import { Router } from 'express';
import { db } from '../data/db.js';

const router = Router();

// GET /api/categories
router.get('/', (req, res) => {
  res.json({ success: true, data: db.getCategories() });
});

export default router;

