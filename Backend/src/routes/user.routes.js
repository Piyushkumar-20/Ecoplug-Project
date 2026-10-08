import express from "express";
import { createUser, getUsers } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import { validateUser } from "../middleware/user.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  validateUser,
  createUser
);

router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getUsers
);

export default router;
