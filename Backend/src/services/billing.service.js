import { getSessionForBillingById } from "../models/sessions.model.js";
import { getCompanyBillingType } from "../models/wallet.model.js";
import { debitPrepaidWallet } from "./wallet.service.js";
import { recordPostpaidSessionUsage } from "./postpaid.service.js";
import ApiError from "../utils/api-error.js";

const processCompletedSessionBilling = async (sessionDbId) => {
  const parsedSessionId = Number(sessionDbId);
  if (!Number.isSafeInteger(parsedSessionId) || parsedSessionId <= 0) {
    throw ApiError.badRequest("A valid numeric session database ID is required");
  }

  // CMS must save the completed session before calling this endpoint.
  const session = await getSessionForBillingById(parsedSessionId);
  if (!session) throw ApiError.notFound("Charging session not found");

  if (String(session.status).toUpperCase() !== "COMPLETED" || !session.endedAt) {
    throw ApiError.badRequest("Only completed charging sessions can be billed");
  }

  if (session.totalCost === null || session.totalCost === undefined) {
    throw ApiError.badRequest("Completed session does not have a final total cost");
  }

  if (String(session.currency).toUpperCase() !== "INR") {
    throw ApiError.badRequest("Only INR charging sessions are currently supported");
  }

  const companyId = Number(session.companyId);
  const company = await getCompanyBillingType(companyId);
  if (!company) throw ApiError.notFound("Session company not found");

  const amount = Number(session.totalCost);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw ApiError.badRequest("Session total cost must be greater than zero");
  }

  const reference = `OCPI-SESSION-${parsedSessionId}`;
  const description = `EV charging session ${session.externalSessionId || parsedSessionId}`;

  if (company.billing_type === "PREPAID") {
    const result = await debitPrepaidWallet({
      companyId,
      amount,
      reference,
      description,
    });

    return {
      billingType: "PREPAID",
      sessionId: parsedSessionId,
      companyId,
      amount: result.amount,
      availableBalance: result.currentBalance,
      alreadyProcessed: result.alreadyProcessed,
      transactionId: result.transactionId,
    };
  }

  if (company.billing_type === "POSTPAID") {
    const result = await recordPostpaidSessionUsage({
      companyId,
      sessionId: parsedSessionId,
    });

    return {
      billingType: "POSTPAID",
      sessionId: parsedSessionId,
      companyId,
      amount: result.amount,
      alreadyProcessed: result.alreadyProcessed,
      usageId: result.usageId,
    };
  }

  throw ApiError.badRequest("Unsupported company billing type");
};

export { processCompletedSessionBilling };
