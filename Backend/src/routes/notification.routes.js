import { Router } from "express";
import {
  getNotifications,
  createNotification,
} from "../controllers/notification.controller.js";
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getNotifications);

// Temporary endpoint for authenticated testing.
// Later, notification creation will be triggered by trusted backend processes.
router.post("/", authMiddleware, createNotification);

export default router;
