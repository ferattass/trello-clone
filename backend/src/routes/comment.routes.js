import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createCommentSchema } from "../validators/card.validators.js";
import {
  getComments,
  createComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(authenticate);

// Göreve ait yorumları listele / yeni yorum ekle
router.get("/task/:taskId", getComments);
router.post("/task/:taskId", validate(createCommentSchema), createComment);

// Yorumu sil
router.delete("/:id", deleteComment);

export default router;
