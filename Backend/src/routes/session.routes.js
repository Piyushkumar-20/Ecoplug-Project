import express from "express";

import {
  getSessionsController,
  getSessionDetailsController,
  processCompletedSessionBillingController,
} from "../controllers/session.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { cmsBillingMiddleware } from "../middleware/cms-billing.middleware.js";

const router = express.Router();

router.post("/billing-completed", cmsBillingMiddleware, processCompletedSessionBillingController);

router.get("/", authMiddleware, getSessionsController);

router.get("/:sessionId", authMiddleware, getSessionDetailsController);

export default router;