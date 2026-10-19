import express from "express";
import { login, refresh, me, logout } from "../controllers/auth.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateLogin } from "../middleware/user.middleware.js";

const router = express.Router();

router.post("/login", validateLogin, login);
router.post("/refresh", refresh);
router.get("/me", authMiddleware, me);
router.post("/logout", logout);

export default router;
