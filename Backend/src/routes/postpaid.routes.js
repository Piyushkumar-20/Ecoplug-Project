import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getPostpaidUsage } from "../controllers/postpaid.controller.js";

const router = express.Router();

// Company users can view only their own POSTPAID usage history and outstanding balance.
router.get("/postpaid/usage", authMiddleware, getPostpaidUsage);

export default router;
