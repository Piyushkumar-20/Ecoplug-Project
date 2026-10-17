import express from "express";
import { getComplaintsController } from "../controllers/complaints.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/", authMiddleware, getComplaintsController);

export default router;
