import { Router } from "express";
import express from 'express';
import { handleWebhook } from "../controllers/webhook.controller";

const router = Router();

router.post('/stripe', express.raw({type: 'application/json'}), handleWebhook)

export default router;