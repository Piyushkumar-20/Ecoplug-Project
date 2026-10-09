import { Router } from "express";
import getLocationsController from "../controllers/location.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getLocationsController);

export default router;
