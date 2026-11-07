import { Router } from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  applyForJob,
  acceptApplication,
} from '../controllers/jobController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/', optionalAuth, getJobs);
router.get('/my-jobs', protect, getMyJobs);
router.get('/:id', optionalAuth, getJobById);

router.post('/', protect, authorize('customer', 'admin'), createJob);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);

// Worker applications
router.post('/:id/apply', protect, authorize('worker', 'admin'), applyForJob);
router.put('/:id/applications/:appId/accept', protect, authorize('customer', 'admin'), acceptApplication);

export default router;

