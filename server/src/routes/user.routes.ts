import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { changePassword, getAllUsers, getProfile, getUserListings, getUserStats, updateProfile } from "../controllers/user.controller";
import { upload } from "../middleware/multer";
import { hasRole } from "../middleware/role";
import { Role } from "@prisma/client";
import { updateListingStatus } from "../controllers/moderator.controller";

const router = Router();

// profile routes
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, upload.single('avatar'), updateProfile)
router.put('/change-password', authenticate, changePassword)

// user stats and listings
router.get('/stats', authenticate, getUserStats)
router.get('/:userId/listings', getUserListings)

//admin routes
router.get('/', authenticate, hasRole([Role.ADMIN]), getAllUsers)
router.put('/listings/:id/status', authenticate, hasRole([Role.MODERATOR]), updateListingStatus)

export default router;