import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { createListing, deleteListing, getListingById, getListings, updateListing } from "../controllers/listing.controller";
import { upload } from "../middleware/multer";

const router = Router();

router.post('/', authenticate, upload.array('files', 5), createListing)
router.get('/', getListings)
router.get('/:id', getListingById)
router.put('/:id', authenticate, upload.array('files', 5), updateListing)
router.delete('/:id', authenticate, deleteListing)

export default router;