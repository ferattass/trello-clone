import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createChecklistSchema,
  updateChecklistSchema,
} from "../validators/card.validators.js";
import {
  getChecklist,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/checklist.controller.js";

const router = Router();

router.use(authenticate);

// Göreve ait checklist maddelerini listele / yeni madde ekle
router.get("/task/:taskId", getChecklist);
router.post("/task/:taskId", validate(createChecklistSchema), createItem);

// Belirli bir maddeyi güncelle veya sil
router.put("/:id", validate(updateChecklistSchema), updateItem);
router.delete("/:id", deleteItem);

export default router;
