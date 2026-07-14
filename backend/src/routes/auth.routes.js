import { Router } from "express";
import {
  register,
  login,
  me,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "../validators/auth.validators.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, me);
router.put("/profile", authenticate, validate(updateProfileSchema), updateProfile);
router.put("/password", authenticate, validate(changePasswordSchema), changePassword);

export default router;
