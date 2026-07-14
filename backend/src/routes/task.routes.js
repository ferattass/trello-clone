import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  updateTaskSchema,
  moveTaskSchema,
} from "../validators/task.validators.js";
import {
  updateTask,
  moveTask,
  deleteTask,
} from "../controllers/task.controller.js";

const router = Router();

router.use(authenticate);

router.put("/:id", validate(updateTaskSchema), updateTask);
router.patch("/:id/move", validate(moveTaskSchema), moveTask);
router.delete("/:id", deleteTask);

export default router;
