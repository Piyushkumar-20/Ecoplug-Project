import {Router} from "express";
import getChargerController from "../controllers/chargers.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";


const router = Router();

router.get("/", authMiddleware,  getChargerController);

export default router;