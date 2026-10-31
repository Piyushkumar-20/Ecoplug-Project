import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import {
  getInvoices,
  getInvoiceDetails,
  recordInvoicePayment,
} from "../controllers/postpaid.controller.js";

const router = express.Router();

router.get("/invoices", authMiddleware, getInvoices);
router.get("/invoices/:invoiceId", authMiddleware, getInvoiceDetails);
router.post(
  "/invoices/:invoiceId/payments",
  authMiddleware,
  authorizeRoles("ADMIN"),
  recordInvoicePayment,
);

export default router;
