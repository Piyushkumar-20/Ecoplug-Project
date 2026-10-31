import db from "../config/db.js";
import ApiError from "../utils/api-error.js";
import { getCompanyBillingType, getAccountByCompanyId } from "../models/wallet.model.js";
import {
  getSessionForPostpaidUsage,
  getPostpaidUsageBySession,
  insertPostpaidUsage,
  increaseOutstandingBalance,
  listCompanyPostpaidUsage,
  countCompanyPostpaidUsage,
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

const listPostpaidUsage = async (companyId, page = 1, limit = 20) => {
  if (!validId(companyId)) throw ApiError.badRequest("A valid company is required");

  const company = await getCompanyBillingType(companyId);
  if (!company) throw ApiError.notFound("Company not found");
  if (company.billing_type !== "POSTPAID") {
    throw ApiError.badRequest("Usage history is only available for POSTPAID companies");
  }

  const safePage = parsePage(page, 1);
  const safeLimit = parsePage(limit, 20);
  const [account, total] = await Promise.all([
    getAccountByCompanyId(companyId),
    countCompanyPostpaidUsage(companyId),
  ]);
  if (!account) throw ApiError.notFound("Company account not found");

  const records = await listCompanyPostpaidUsage(companyId, {
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  });

  return {
    billingType: "POSTPAID",
    outstandingBalance: String(account.outstanding_balance),
    currency: "INR",
    records,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export {
  recordPostpaidSessionUsage,
  listPostpaidUsage,
};
