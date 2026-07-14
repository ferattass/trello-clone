import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { validate } from "../middleware/validate.js";
import { createAccountSchema } from "../validators/admin.validators.js";
import {
  getStats,
  getUsers,
  getTeams,
  getProjects,
  createAccount,
} from "../controllers/admin.controller.js";

const router = Router();

// Tüm admin route'ları önce kimlik doğrulamasından, sonra yetki kontrolünden geçer.
router.use(authenticate);
router.use(requireAdmin);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.get("/teams", getTeams);
router.get("/projects", getProjects);
router.post("/accounts", validate(createAccountSchema), createAccount);

export default router;
