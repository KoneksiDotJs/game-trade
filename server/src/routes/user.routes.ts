import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { changePassword, getAllUsers, getProfile, getUserById, getUserListings, getUserRegisterStats, getUserStats, updateProfile, updateUserStatus } from "../controllers/user.controller";
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
router.get('/:id', authenticate, hasRole([Role.ADMIN]), getUserById)
router.get('/', authenticate, hasRole([Role.ADMIN]), getAllUsers)
router.put('/listings/:id/status', authenticate, hasRole([Role.MODERATOR, Role.ADMIN]), updateListingStatus)
router.put('/:id/status', authenticate, hasRole([Role.ADMIN]), updateUserStatus)
router.get('/admin/stats', authenticate, hasRole([Role.ADMIN]), getUserRegisterStats)

export default router;