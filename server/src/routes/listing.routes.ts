import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { createListing, deleteListing, getListingById, getListings } from "../controllers/listing.controller";

const router = Router();

router.post('/', authenticate, createListing)
router.get('/', getListings)
router.get('/:id', getListingById)
router.delete('/:id', authenticate, deleteListing)

export default router;