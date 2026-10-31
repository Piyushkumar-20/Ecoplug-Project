import db from "../config/db.js";
import ApiError from "../utils/api-error.js";
import { getCompanyBillingType, getAccountByCompanyId } from "../models/wallet.model.js";
import {
  getSessionForPostpaidUsage,
  getCompletedSessionsForPeriod,
  getPostpaidUsageBySession,
  insertPostpaidUsage,
  increaseOutstandingBalance,
  getUninvoicedUsage,
  findInvoiceForPeriod,
  insertInvoice,
  insertInvoiceItems,
  listCompanyInvoices,
  getCompanyInvoiceById,
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

const accrueCompletedSessionsForPeriod = async ({ companyId, startDate, endDate }) => {
  if (!validId(companyId)) throw ApiError.badRequest("A valid companyId is required");
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(startDate || "") || !datePattern.test(endDate || "") || startDate > endDate) {
    throw ApiError.badRequest("Valid startDate and endDate are required in YYYY-MM-DD format");
  }

  const company = await getCompanyBillingType(companyId);
  if (!company) throw ApiError.notFound("Company not found");
  if (company.billing_type !== "POSTPAID") {
    throw ApiError.badRequest("Session accrual is only allowed for POSTPAID companies");
  }

  const sessions = await getCompletedSessionsForPeriod(companyId, startDate, endDate);
  const results = [];
  for (const session of sessions) {
    results.push(await recordPostpaidSessionUsage({ companyId, sessionId: session.id }));
  }
  return {
    companyId: Number(companyId),
    periodStart: startDate,
    periodEnd: endDate,
    scannedSessions: sessions.length,
    newlyAccrued: results.filter((item) => !item.alreadyProcessed).length,
    alreadyAccrued: results.filter((item) => item.alreadyProcessed).length,
    results,
  };
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
  if (!validId(invoiceId)) throw ApiError.badRequest("A valid invoiceId is required");
  const invoice = await getCompanyInvoiceById(companyId, invoiceId);
  if (!invoice) throw ApiError.notFound("Invoice not found");
  return invoice;
};

export {
  recordPostpaidSessionUsage,
  accrueCompletedSessionsForPeriod,
  generateMonthlyInvoices,
  listInvoices,
  getInvoiceDetails,
};
