import express from "express";
import { createUser } from "../controllers/user.controller.js";
import { validateUser } from "../middleware/user.middleware.js";

const router = express.Router();

router.post("/", validateUser, createUser);

export default router;
