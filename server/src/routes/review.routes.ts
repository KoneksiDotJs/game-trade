import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { createReview, getAllReviews, getReview } from "../controllers/review.controller";

const router = Router();

router.post('/', authenticate, createReview)
router.get('/:id', authenticate, getReview)
router.get('/', authenticate, getAllReviews)

export default router;