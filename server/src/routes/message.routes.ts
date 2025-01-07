import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { getMessage, sendMessage } from "../controllers/message.controller";

const router = Router();

router.post('/', authenticate, sendMessage)
router.get('/:id', authenticate, getMessage)

export default router;