import express from "express";

import {
  getSessionsController,
  getSessionDetailsController,
} from "../controllers/session.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getSessionsController);

router.get("/:sessionId", authMiddleware, getSessionDetailsController);

export default router;