import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getMyNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getMyNotifications);
router.get("/unread-count", getUnreadCount);
// read-all sabit yol olduğu için /:id parametresinden önce tanımlanmalı.
router.put("/read-all", markAllRead);
router.put("/:id/read", markRead);
router.delete("/:id", deleteNotification);

export default router;
