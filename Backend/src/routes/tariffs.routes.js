import express from "express";
import { getTariffsController } from "../controllers/tariff.controller.js";

const router = express.Router();

router.get("/", getTariffsController);

export default router;
