import { Router } from 'express';
import { createReview, getWorkerReviews } from '../controllers/reviewController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/worker/:workerId', optionalAuth, getWorkerReviews);
router.post('/', protect, authorize('customer', 'admin'), createReview);

export default router;

