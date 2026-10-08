import express from "express";
import { register } from "../controllers/company.controller.js";
import { validateCompanyRegistration } from "../middleware/company.middleware.js";

const router = express.Router();

router.post("/register", validateCompanyRegistration, register);

export default router;
