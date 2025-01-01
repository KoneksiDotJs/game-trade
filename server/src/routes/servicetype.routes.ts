import { Router } from "express";
import { createServiceType, getServiceTypeById, getServiceTypes } from "../controllers/servicetype.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.get('/', getServiceTypes)
router.get('/:id', getServiceTypeById)
router.post('/', authenticate, createServiceType)

export default router;