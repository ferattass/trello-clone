import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createLabelSchema,
  updateLabelSchema,
  attachLabelSchema,
} from "../validators/card.validators.js";
import {
  getProjectLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  attachLabel,
  detachLabel,
} from "../controllers/label.controller.js";

const router = Router();

router.use(authenticate);

// Projenin etiketlerini listele / yeni etiket oluştur
router.get("/project/:projectId", getProjectLabels);
router.post("/project/:projectId", validate(createLabelSchema), createLabel);

// Belirli bir etiketi güncelle veya sil
router.put("/:id", validate(updateLabelSchema), updateLabel);
router.delete("/:id", deleteLabel);

// Göreve etiket ekle / kaldır
router.post("/task/:taskId", validate(attachLabelSchema), attachLabel);
router.delete("/task/:taskId/:labelId", detachLabel);

export default router;
