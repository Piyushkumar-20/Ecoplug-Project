import express from "express";
import { register, getProfile} from "../controllers/company.controller.js";
import { validateCompanyRegistration } from "../middleware/company.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js"

const router = express.Router();

router.post("/register", validateCompanyRegistration, register);
router.get("/profile", authMiddleware, getProfile);

export default router;
