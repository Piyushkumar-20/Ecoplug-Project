import express from "express";
import { getTariffsController } from "../controllers/tariff.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getTariffsController);

export default router;
