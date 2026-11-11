import { Router } from 'express';
import {
  getAllWorkers,
  getNearbyWorkers,
  getWorkerById,
  getMyWorkerProfile,
  updateMyProfile,
  updateMyLocation,
  updateMyPermanentAddress,
  uploadPortfolioImages,
  updateAvailability,
  deleteWorkerProfile,
} from '../controllers/workerController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/', optionalAuth, getAllWorkers);
router.get('/nearby', optionalAuth, getNearbyWorkers);
router.get('/me/profile', protect, authorize('worker', 'admin'), getMyWorkerProfile);
router.get('/:id', optionalAuth, getWorkerById);

router.post('/profile', protect, authorize('worker', 'admin'), updateMyProfile);
router.put('/location', protect, authorize('worker', 'admin'), updateMyLocation);
router.put('/permanent-address', protect, authorize('worker', 'admin'), updateMyPermanentAddress);
router.put('/availability', protect, authorize('worker', 'admin'), updateAvailability);
router.post(
  '/portfolio-images',
  protect,
  authorize('worker', 'admin'),
  upload.array('images', 8),
  uploadPortfolioImages
);
router.delete('/:id', protect, authorize('worker', 'admin'), deleteWorkerProfile);

export default router;

