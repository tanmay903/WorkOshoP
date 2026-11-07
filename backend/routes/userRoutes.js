import { Router } from 'express';
import { getUserById, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/:id', getUserById);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);

export default router;

