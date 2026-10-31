import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getInvoices,
  getInvoiceDetails,
} from "../controllers/postpaid.controller.js";

const router = express.Router();

router.get("/invoices", authMiddleware, getInvoices);
router.get("/invoices/:invoiceId", authMiddleware, getInvoiceDetails);

export default router;
