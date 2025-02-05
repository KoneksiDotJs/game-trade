import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { createListing, deleteListing, getListingById, getListings, getListingStats, updateListing } from "../controllers/listing.controller";
import { upload } from "../middleware/multer";
import { hasRole } from "../middleware/role";
import { Role } from "@prisma/client";

const router = Router();

router.post('/', authenticate, upload.array('files', 5), createListing)
router.get('/', getListings)
router.get('/:id', getListingById)
router.put('/:id', authenticate, upload.array('files', 5), updateListing)
router.delete('/:id', authenticate, deleteListing)

// admin routes
router.get('/admin/stats', authenticate, hasRole([Role.ADMIN]), getListingStats);

export default router;