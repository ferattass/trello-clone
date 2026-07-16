import { Router } from "express";
import {
  register,
  login,
  me,
  updateProfile,
  changePassword,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validators.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter, mailLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/verify-email", authLimiter, validate(verifyEmailSchema), verifyEmail);
router.post("/resend-verification", mailLimiter, validate(resendVerificationSchema), resendVerification);
router.post("/forgot-password", mailLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);
router.get("/me", authenticate, me);
router.put("/profile", authenticate, validate(updateProfileSchema), updateProfile);
router.put("/password", authenticate, validate(changePasswordSchema), changePassword);

export default router;
