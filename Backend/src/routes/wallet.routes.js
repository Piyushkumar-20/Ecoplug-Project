import express from "express";

import {
  creditWallet,
  debitWallet,
  getBalance,
  getTransactions,
} from "../controllers/wallet.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { walletInternalApiKeyMiddleware } from "../middleware/wallet-internal-api-key.middleware.js";

const router = express.Router();

// Internal EcoPlug operation
router.post("/admin/credit", walletInternalApiKeyMiddleware, creditWallet);

// Company-facing operations
router.get("/balance", authMiddleware, getBalance);
router.post("/debit", authMiddleware, debitWallet);
router.get("/transactions", authMiddleware, getTransactions);

export default router;