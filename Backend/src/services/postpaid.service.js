import db from "../config/db.js";
import ApiError from "../utils/api-error.js";
import { getCompanyBillingType, getAccountByCompanyId } from "../models/wallet.model.js";
import {
  getSessionForPostpaidUsage,
  getPostpaidUsageBySession,
  insertPostpaidUsage,
  increaseOutstandingBalance,
  getUninvoicedUsage,
  findInvoiceForPeriod,
  insertInvoice,
  insertInvoiceItems,
  listCompanyInvoices,
  getCompanyInvoiceById,
  getInvoiceForUpdate,
  getPaymentByReference,
  insertPaymentRecord,
  updateInvoicePayment,
  decreaseOutstandingBalance,
} from "../models/postpaid.model.js";

const toPaise = (value) => Math.round(Number(value) * 100);
const fromPaise = (value) => (value / 100).toFixed(2);
const validId = (value) => Number.isSafeInteger(Number(value)) && Number(value) > 0;

const parsePage = (value, fallback, max = 100) =>
  Math.min(max, Math.max(1, Number.parseInt(value, 10) || fallback));

// Internal service function. Call only from a trusted session-completion flow.
// It is deliberately not exposed as a public HTTP endpoint.
const recordPostpaidSessionUsage = async ({ companyId, sessionId }) => {
  if (!validId(companyId) || !validId(sessionId)) {
    throw ApiError.badRequest("Valid companyId and sessionId are required");
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const company = await getCompanyBillingType(companyId, connection);
    if (!company) throw ApiError.notFound("Company not found");
    if (company.billing_type !== "POSTPAID") {
      throw ApiError.badRequest("Usage accrual is only allowed for POSTPAID companies");
    }

    const account = await getAccountByCompanyId(companyId, connection, true);
    if (!account) throw ApiError.notFound("Company account not found");
    if (account.status !== "ACTIVE") {
      throw ApiError.forbidden("Company account is not active");
    }

    const existing = await getPostpaidUsageBySession(companyId, sessionId, connection);
    if (existing) {
      await connection.commit();
      return {
        companyId: Number(companyId),
        sessionId: Number(sessionId),
        usageId: existing.id,
        amount: String(existing.amount),
        alreadyProcessed: true,
      };
    }

    const session = await getSessionForPostpaidUsage(sessionId, companyId, connection);
    if (!session) throw ApiError.notFound("Charging session not found for this company");
    if (String(session.status).toUpperCase() !== "COMPLETED") {
      throw ApiError.badRequest("Only COMPLETED charging sessions can be accrued");
    }
    if (session.end_date_time == null || session.total_cost == null) {
      throw ApiError.badRequest("Completed session must have an end time and total cost");
    }
    if (String(session.currency).toUpperCase() !== "INR") {
      throw ApiError.badRequest("Only INR sessions are supported by the current billing setup");
    }

    const amountPaise = toPaise(session.total_cost);
    if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
      throw ApiError.badRequest("Session total cost must be greater than zero");
    }

    const amount = fromPaise(amountPaise);
    const currentOutstandingPaise = toPaise(account.outstanding_balance);
    const creditLimitPaise = toPaise(account.credit_limit);
    if (creditLimitPaise > 0 && currentOutstandingPaise + amountPaise > creditLimitPaise) {
      throw ApiError.conflict("POSTPAID credit limit would be exceeded");
    }
    const usageDate = session.usageDate;
    const description = `EV charging session ${session.session_id || session.id}`;

    const usageResult = await insertPostpaidUsage({
      companyId: Number(companyId),
      accountId: account.id,
      sessionId: Number(sessionId),
      usageDate,
      amount,
      currency: "INR",
      description,
    }, connection);

    await increaseOutstandingBalance(account.id, amount, connection);
    await connection.commit();

    return {
      companyId: Number(companyId),
      sessionId: Number(sessionId),
      usageId: usageResult.insertId,
      amount,
      currency: "INR",
      alreadyProcessed: false,
    };
  } catch (error) {
    await connection.rollback();
    if (error?.code === "ER_DUP_ENTRY") {
      throw ApiError.conflict("This charging session has already been recorded for POSTPAID billing");
    }
    throw error;
  } finally {
    connection.release();
  }
};

const generateMonthlyInvoices = async ({ year, month, companyId = null }) => {
  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 9999 ||
      !Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    throw ApiError.badRequest("A valid year and month (1-12) are required");
  }
  if (companyId !== null && !validId(companyId)) {
    throw ApiError.badRequest("A valid companyId is required");
  }

  const periodStart = `${parsedYear}-${String(parsedMonth).padStart(2, "0")}-01`;
  const periodEndDate = new Date(Date.UTC(parsedYear, parsedMonth, 0));
  const periodEnd = periodEndDate.toISOString().slice(0, 10);
  const issueDate = new Date(Date.UTC(parsedYear, parsedMonth, 1)).toISOString().slice(0, 10);
  const dueDate = new Date(Date.UTC(parsedYear, parsedMonth, 8)).toISOString().slice(0, 10);

  const [companies] = await db.query(
    `SELECT c.id
     FROM companies c
     INNER JOIN company_accounts ca ON ca.company_id = c.id
     WHERE c.billing_type = 'POSTPAID'
       AND (? IS NULL OR c.id = ?)
     ORDER BY c.id ASC`,
    [companyId, companyId],
  );

  const results = [];
  for (const companyRow of companies) {
    const currentCompanyId = companyRow.id;
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const account = await getAccountByCompanyId(currentCompanyId, connection, true);
      if (!account) {
        await connection.rollback();
        results.push({ companyId: currentCompanyId, generated: false, reason: "Company account unavailable" });
        continue;
      }

      const existingInvoice = await findInvoiceForPeriod(
        currentCompanyId, periodStart, periodEnd, connection,
      );
      const usages = await getUninvoicedUsage(
        currentCompanyId, periodStart, periodEnd, connection,
      );

      if (existingInvoice) {
        if (usages.length) {
          throw ApiError.conflict(
            `Invoice ${existingInvoice.invoice_number} already exists but unbilled usage remains; manual adjustment is required`,
          );
        }
        await connection.commit();
        results.push({
          companyId: currentCompanyId,
          generated: false,
          alreadyGenerated: true,
          invoiceId: existingInvoice.id,
          invoiceNumber: existingInvoice.invoice_number,
        });
        continue;
      }

      if (!usages.length) {
        await connection.commit();
        results.push({ companyId: currentCompanyId, generated: false, reason: "No uninvoiced usage for this period" });
        continue;
      }

      const totalPaise = usages.reduce((sum, usage) => sum + toPaise(usage.amount), 0);
      if (!Number.isSafeInteger(totalPaise) || totalPaise <= 0) {
        throw ApiError.badRequest("Invoice total is invalid");
      }
      const totalAmount = fromPaise(totalPaise);
      const invoiceNumber = `ECO-${currentCompanyId}-${parsedYear}${String(parsedMonth).padStart(2, "0")}`;

      const invoiceResult = await insertInvoice({
        companyId: currentCompanyId,
        invoiceNumber,
        periodStart,
        periodEnd,
        subtotal: totalAmount,
        totalAmount,
        issueDate,
        dueDate,
      }, connection);

      await insertInvoiceItems(invoiceResult.insertId, usages, connection);
      await connection.commit();

      results.push({
        companyId: currentCompanyId,
        generated: true,
        invoiceId: invoiceResult.insertId,
        invoiceNumber,
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        issueDate,
        dueDate,
        subtotal: totalAmount,
        taxAmount: "0.00",
        totalAmount,
        itemCount: usages.length,
        currency: "INR",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  return { periodStart, periodEnd, issueDate, dueDate, results };
};

const listInvoices = async (companyId, page = 1, limit = 20) => {
  const company = await getCompanyBillingType(companyId);
  if (!company) throw ApiError.notFound("Company not found");
  if (company.billing_type !== "POSTPAID") {
    throw ApiError.badRequest("Invoices are only available for POSTPAID companies");
  }

  const safePage = parsePage(page, 1);
  const safeLimit = parsePage(limit, 20);
  const [countRows] = await db.query(
    "SELECT COUNT(*) AS total FROM invoices WHERE company_id = ?",
    [companyId],
  );
  const total = Number(countRows[0]?.total ?? 0);
  const invoices = await listCompanyInvoices(companyId, {
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  });
  return {
    invoices,
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
  };
};

const getInvoiceDetails = async (companyId, invoiceId) => {
  const company = await getCompanyBillingType(companyId);
  if (!company) throw ApiError.notFound("Company not found");
  if (company.billing_type !== "POSTPAID") {
    throw ApiError.badRequest("Invoices are only available for POSTPAID companies");
  }

  if (!validId(invoiceId)) throw ApiError.badRequest("A valid invoiceId is required");
  const invoice = await getCompanyInvoiceById(companyId, invoiceId);
  if (!invoice) throw ApiError.notFound("Invoice not found");
  return invoice;
};


const recordInvoicePayment = async ({
  companyId,
  invoiceId,
  amount,
  paymentMethod,
  transactionReference,
  paymentDate,
  notes,
  recordedBy,
}) => {
  if (!validId(companyId) || !validId(invoiceId)) {
    throw ApiError.badRequest("Valid companyId and invoiceId are required");
  }

  const amountNumber = Number(amount);
  if (!Number.isFinite(amountNumber) || amountNumber <= 0 ||
      Math.abs(amountNumber * 100 - Math.round(amountNumber * 100)) > 0.000001) {
    throw ApiError.badRequest("Payment amount must be positive with at most two decimal places");
  }

  const allowedMethods = ["UPI", "BANK_TRANSFER", "NEFT", "RTGS", "IMPS", "CHEQUE", "CASH", "OTHER"];
  const normalizedMethod = String(paymentMethod || "").trim().toUpperCase();
  if (!allowedMethods.includes(normalizedMethod)) {
    throw ApiError.badRequest(`paymentMethod must be one of: ${allowedMethods.join(", ")}`);
  }

  if (notes !== undefined && notes !== null && typeof notes !== "string") {
    throw ApiError.badRequest("notes must be a string");
  }

  const reference = typeof transactionReference === "string"
    ? transactionReference.trim()
    : "";
  if (!reference || reference.length > 150) {
    throw ApiError.badRequest("A transactionReference between 1 and 150 characters is required");
  }

  const normalizedDate = paymentDate || new Date();
  if (Number.isNaN(new Date(normalizedDate).getTime())) {
    throw ApiError.badRequest("A valid paymentDate is required");
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const company = await getCompanyBillingType(companyId, connection);
    if (!company) throw ApiError.notFound("Company not found");
    if (company.billing_type !== "POSTPAID") {
      throw ApiError.badRequest("Invoice payments are only allowed for POSTPAID companies");
    }

    const account = await getAccountByCompanyId(companyId, connection, true);
    if (!account) throw ApiError.notFound("Company account not found");
    if (account.status !== "ACTIVE") {
      throw ApiError.forbidden("Company account is not active");
    }

    const existingPayment = await getPaymentByReference(companyId, reference, connection);
    if (existingPayment) {
      if (Number(existingPayment.invoice_id) !== Number(invoiceId) ||
          toPaise(existingPayment.amount) !== toPaise(amountNumber) ||
          existingPayment.payment_method !== normalizedMethod) {
        throw ApiError.conflict("This transaction reference has already been used with different payment details");
      }
      await connection.commit();
      return {
        paymentId: existingPayment.id,
        invoiceId: Number(invoiceId),
        companyId: Number(companyId),
        amount: fromPaise(toPaise(existingPayment.amount)),
        alreadyProcessed: true,
      };
    }

    const invoice = await getInvoiceForUpdate(companyId, invoiceId, connection);
    if (!invoice) throw ApiError.notFound("Invoice not found");
    if (invoice.status === "CANCELLED") {
      throw ApiError.conflict("Payments cannot be recorded against a cancelled invoice");
    }

    const amountPaise = toPaise(amountNumber);
    const totalPaise = toPaise(invoice.total_amount);
    const paidPaise = toPaise(invoice.paid_amount);
    const duePaise = totalPaise - paidPaise;

    if (amountPaise > duePaise) {
      throw ApiError.conflict("Payment amount exceeds the remaining invoice balance");
    }

    const outstandingPaise = toPaise(account.outstanding_balance);
    if (outstandingPaise < amountPaise) {
      throw ApiError.conflict("Company outstanding balance is lower than the invoice payment; billing records require reconciliation");
    }

    const newPaidPaise = paidPaise + amountPaise;
    const newOutstandingPaise = outstandingPaise - amountPaise;
    const paymentAmount = fromPaise(amountPaise);

    const paymentResult = await insertPaymentRecord({
      companyId: Number(companyId),
      invoiceId: Number(invoiceId),
      amount: paymentAmount,
      paymentMethod: normalizedMethod,
      transactionReference: reference,
      paymentDate: normalizedDate,
      notes: notes?.trim() || null,
      recordedBy: recordedBy ? String(recordedBy) : null,
    }, connection);

    await updateInvoicePayment(
      invoiceId,
      fromPaise(newPaidPaise),
      connection,
    );

    const balanceUpdate = await decreaseOutstandingBalance(
      account.id,
      paymentAmount,
      connection,
    );
    if (balanceUpdate.affectedRows !== 1) {
      throw ApiError.conflict("Unable to update company outstanding balance");
    }

    const updatedInvoice = await getInvoiceForUpdate(companyId, invoiceId, connection);
    await connection.commit();

    return {
      paymentId: paymentResult.insertId,
      companyId: Number(companyId),
      invoiceId: Number(invoiceId),
      amount: paymentAmount,
      paidAmount: fromPaise(newPaidPaise),
      remainingInvoiceAmount: fromPaise(totalPaise - newPaidPaise),
      outstandingBalance: fromPaise(newOutstandingPaise),
      invoiceStatus: updatedInvoice.status,
      alreadyProcessed: false,
    };
  } catch (error) {
    await connection.rollback();
    if (error?.code === "ER_DUP_ENTRY") {
      throw ApiError.conflict("This payment transaction reference has already been processed");
    }
    throw error;
  } finally {
    connection.release();
  }
};

export {
  recordPostpaidSessionUsage,
  generateMonthlyInvoices,
  listInvoices,
  getInvoiceDetails,
  recordInvoicePayment,
};
