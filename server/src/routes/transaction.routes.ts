import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { createTransaction, getTransactionById, getTransactionStats, getUserTransactions, updateTransactionStatus } from "../controllers/transaction.controller";
import { hasRole } from "../middleware/role";
import { Role } from "@prisma/client";

const router = Router();

router.post('/', authenticate, createTransaction)
router.get('/', authenticate, getUserTransactions)
router.get('/:id', authenticate, getTransactionById)
router.patch('/:id/status', authenticate, updateTransactionStatus)

// admin routes
router.get('/admin/stats', authenticate, hasRole([Role.ADMIN]), getTransactionStats)

export default router;