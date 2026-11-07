import { Router } from 'express';
import {
  getAdminStats,
  toggleWorkerVerification,
  getAllUsers,
  toggleUserStatus,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

// Enforce admin privileges across all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/workers/:id/verify', toggleWorkerVerification);
router.put('/users/:id/toggle-status', toggleUserStatus);

export default router;

