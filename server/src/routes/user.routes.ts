import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { getProfile, getUserListings, getUserStats, updateProfile } from "../controllers/user.controller";
import { upload } from "../middleware/multer";

const router = Router();

// profile routes
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, upload.single('avatar'), updateProfile)

// user stats and listings
router.get('/stats', authenticate, getUserStats)
router.get('/:userId/listings', getUserListings)

export default router;