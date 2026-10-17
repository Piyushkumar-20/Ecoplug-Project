import express from "express";
import {
  getComplaintsController,
  getComplaintDetailsController,
} from "../controllers/complaints.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/", authMiddleware, getComplaintsController);
router.get("/:id", authMiddleware, getComplaintDetailsController);
export default router;
