import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { createTransaction, getTransactionById, getUserTransactions, updateTransactionStatus } from "../controllers/transaction.controller";

const router = Router();

router.post('/', authenticate, createTransaction)
router.get('/', authenticate, getUserTransactions)
router.get('/:id', authenticate, getTransactionById)
router.patch('/:id/status', authenticate, updateTransactionStatus)

export default router;