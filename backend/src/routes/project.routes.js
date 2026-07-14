import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from "../validators/project.validators.js";
import { createColumnSchema } from "../validators/column.validators.js";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
} from "../controllers/project.controller.js";
import { getColumns, createColumn } from "../controllers/column.controller.js";
import { getTasks } from "../controllers/task.controller.js";

const router = Router();

// Tum proje route'lari giris (token) ister
router.use(authenticate);

router.post("/", validate(createProjectSchema), createProject);
router.get("/", getProjects);
router.get("/:id", getProject);
router.put("/:id", validate(updateProjectSchema), updateProject);
router.delete("/:id", deleteProject);
router.post("/:id/members", validate(addMemberSchema), addMember);

// Projeye bagli sutunlar ve gorevler
router.get("/:id/columns", getColumns);
router.post("/:id/columns", validate(createColumnSchema), createColumn);
router.get("/:id/tasks", getTasks);

export default router;
