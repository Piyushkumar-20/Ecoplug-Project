import express from "express";

import {
  creditWallet,
  getBalance,
  getTransactions,
} from "../controllers/wallet.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Temporary: EcoPlug internal wallet credit through Apidog
router.post("/admin/credit", creditWallet);

// Company users can view their own company's wallet
router.get("/balance", authMiddleware, getBalance);

router.get("/transactions", authMiddleware, getTransactions);

export default router;