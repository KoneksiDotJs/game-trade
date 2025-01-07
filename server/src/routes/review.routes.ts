import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { createReview, getReview } from "../controllers/review.controller";

const router = Router();

router.post('/', authenticate, createReview)
router.get('/:id', authenticate, getReview)

export default router;