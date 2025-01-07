import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { getAllMessages, getMessage, sendMessage } from "../controllers/message.controller";

const router = Router();

router.post('/', authenticate, sendMessage)
router.get('/:id', authenticate, getMessage)
router.get('/', authenticate, getAllMessages)

export default router;