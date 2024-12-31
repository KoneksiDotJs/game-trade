import { Router } from "express";
import { register, login, verifyEmail, resendVerification, forgotPassword, resetPassword } from "../controllers/auth.controller";
import { validateLogin, validateRegister } from "../middleware/validate";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
