import express from "express";

import {
  creditWallet,
  getBalance,
  getTransactions,
} from "../controllers/wallet.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { walletInternalApiKeyMiddleware } from "../middleware/wallet-internal-api-key.middleware.js";

const router = express.Router();

// Internal EcoPlug wallet credit operation
router.post("/admin/credit", walletInternalApiKeyMiddleware, creditWallet);

// Company-facing wallet operations
router.get("/balance", authMiddleware, getBalance);
router.get("/transactions", authMiddleware, getTransactions);

export default router;