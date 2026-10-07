import express from "express";
import { createCompany } from "../controllers/company.controller.js";
import { validateCompany } from "../middleware/company.middleware.js";

const router = express.Router();

router.post("/", validateCompany, createCompany);

export default router;