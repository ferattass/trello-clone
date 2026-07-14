import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  updateColumnSchema,
  moveColumnSchema,
  reorderColumnSchema,
} from "../validators/column.validators.js";
import { createTaskSchema } from "../validators/task.validators.js";
import {
  updateColumn,
  moveColumn,
  deleteColumn,
  reorderColumn,
} from "../controllers/column.controller.js";
import { createTask } from "../controllers/task.controller.js";

const router = Router();

router.use(authenticate);

router.put("/:id", validate(updateColumnSchema), updateColumn);
router.patch("/:id/move", validate(moveColumnSchema), moveColumn);
router.put("/:id/reorder", validate(reorderColumnSchema), reorderColumn);
router.delete("/:id", deleteColumn);

// Sutuna gorev ekle
router.post("/:id/tasks", validate(createTaskSchema), createTask);

export default router;
