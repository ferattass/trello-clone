import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getProjectActivity } from "../controllers/activity.controller.js";

const router = Router();

router.use(authenticate);

router.get("/project/:projectId", getProjectActivity);

export default router;
