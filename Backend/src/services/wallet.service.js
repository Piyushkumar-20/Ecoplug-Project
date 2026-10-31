import db from "../config/db.js";
import ApiError from "../utils/api-error.js";

import {
  getCompanyBillingType,
  getAccountByCompanyId,
  insertWalletTransaction,
  getWalletTransactionByReference,
  updateAvailableBalance,
  getWalletTransactions,
  getWalletTransactionSummary,
} from "../models/wallet.model.js";

// Convert rupees to integer paise for accurate arithmetic
const toCents = (value) => {
  const amount = Number(value);
  return Math.round(amount * 100);
};

// Convert integer paise back to rupees
const fromCents = (value) => (value / 100).toFixed(2);

const creditPrepaidWallet = async ({
  companyId,
  amount,
  description,
  reference,
}) => {
  // 1. Validate company ID
  if (!Number.isSafeInteger(Number(companyId)) || Number(companyId) <= 0) {
    throw ApiError.badRequest("A valid companyId is required");
  }

  // 2. Validate amount
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isFinite(toCents(amount)) ||
    toCents(amount) <= 0
  ) {
    throw ApiError.badRequest(
      "amount must be a positive number with up to two decimal places",
    );
  }

  if (Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) {
    throw ApiError.badRequest("amount can have at most two decimal places");
  }

  // 3. Validate transaction reference
  const normalizedReference =
    typeof reference === "string" ? reference.trim() : "";

  if (!normalizedReference || normalizedReference.length > 100) {
    throw ApiError.badRequest(
      "A valid reference between 1 and 100 characters is required",
    );
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 4. Check company existence and billing type
    const company = await getCompanyBillingType(companyId, connection);

    if (!company) {
      throw ApiError.notFound("Company not found");
    }

    if (company.billing_type !== "PREPAID") {
      throw ApiError.badRequest(
        "Wallet credits are only allowed for PREPAID companies",
      );
    }

    // 5. Fetch and lock company account
    // This serializes credit operations for the same company.
    const account = await getAccountByCompanyId(companyId, connection, true);

    if (!account) {
      throw ApiError.notFound("Company wallet account not found");
    }

    if (account.status !== "ACTIVE") {
      throw ApiError.forbidden("Company wallet account is not active");
    }

    // 6. Check whether this reference was already processed
    const existingTransaction = await getWalletTransactionByReference(
      companyId,
      "ADMIN_REFERENCE",
      normalizedReference,
      connection,
    );

    if (existingTransaction) {
      const existingAmountCents = toCents(existingTransaction.amount);

      const requestedAmountCents = toCents(amount);

      // Same reference with a different amount is not allowed
      if (existingAmountCents !== requestedAmountCents) {
        throw ApiError.conflict(
          "This reference has already been used with a different amount",
        );
      }

      // Same reference and same amount:
      // Return original transaction without crediting again.
      await connection.commit();

      return {
        transactionId: existingTransaction.id,
        companyId: Number(companyId),
        amount: fromCents(existingAmountCents),
        previousBalance: fromCents(toCents(existingTransaction.balance_before)),
        currentBalance: fromCents(toCents(existingTransaction.balance_after)),
        currency: "INR",
        alreadyProcessed: true,
      };
    }

    // 7. Calculate new balance
    const beforeCents = toCents(account.available_balance);
    const creditCents = toCents(amount);
    const afterCents = beforeCents + creditCents;

    if (!Number.isSafeInteger(afterCents)) {
      throw ApiError.badRequest("Wallet balance exceeds the supported limit");
    }

    const balanceBefore = fromCents(beforeCents);
    const balanceAfter = fromCents(afterCents);
    const normalizedAmount = fromCents(creditCents);

    // 8. Update wallet balance
    await updateAvailableBalance(account.id, balanceAfter, connection);

    // 9. Insert transaction history
    const transactionResult = await insertWalletTransaction(
      {
        companyId: Number(companyId),
        account_id: account.id,
        transaction_type: "CREDIT",
        amount: normalizedAmount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_type: "ADMIN_REFERENCE",
        reference_id: normalizedReference,
        description:
          description?.trim() || "Wallet credited by EcoPlug internal operator",
        created_by: "INTERNAL_API",
      },
      connection,
    );

    await connection.commit();

    return {
      transactionId: transactionResult.insertId,
      companyId: Number(companyId),
      amount: normalizedAmount,
      previousBalance: balanceBefore,
      currentBalance: balanceAfter,
      currency: "INR",
      alreadyProcessed: false,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const debitPrepaidWallet = async ({
  companyId,
  amount,
  description,
  reference,
}) => {
  // 1. Validate company ID
  if (!Number.isSafeInteger(Number(companyId)) || Number(companyId) <= 0) {
    throw ApiError.badRequest("A valid companyId is required");
  }

  // 2. Validate amount
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isFinite(toCents(amount)) ||
    toCents(amount) <= 0
  ) {
    throw ApiError.badRequest(
      "amount must be a positive number with up to two decimal places",
    );
  }

  if (Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) {
    throw ApiError.badRequest("amount can have at most two decimal places");
  }

  // 3. Validate reference
  const normalizedReference =
    typeof reference === "string" ? reference.trim() : "";

  if (!normalizedReference || normalizedReference.length > 100) {
    throw ApiError.badRequest(
      "A valid reference between 1 and 100 characters is required",
    );
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 4. Check company and billing type
    const company = await getCompanyBillingType(companyId, connection);

    if (!company) {
      throw ApiError.notFound("Company not found");
    }

    if (company.billing_type !== "PREPAID") {
      throw ApiError.badRequest(
        "Wallet debits are only allowed for PREPAID companies",
      );
    }

    // 5. Lock wallet account
    const account = await getAccountByCompanyId(companyId, connection, true);

    if (!account) {
      throw ApiError.notFound("Company wallet account not found");
    }

    if (account.status !== "ACTIVE") {
      throw ApiError.forbidden("Company wallet account is not active");
    }

    // 6. Check duplicate debit
    const existingTransaction = await getWalletTransactionByReference(
      companyId,
      "SESSION_DEBIT",
      normalizedReference,
      connection,
    );

    if (existingTransaction) {
      const existingAmountCents = toCents(existingTransaction.amount);

      const requestedAmountCents = toCents(amount);

      if (
        existingTransaction.transaction_type !== "DEBIT" ||
        existingAmountCents !== requestedAmountCents
      ) {
        throw ApiError.conflict(
          "This reference has already been used with different transaction details",
        );
      }

      await connection.commit();

      return {
        transactionId: existingTransaction.id,
        companyId: Number(companyId),
        transactionType: "DEBIT",
        amount: fromCents(existingAmountCents),
        previousBalance: fromCents(toCents(existingTransaction.balance_before)),
        currentBalance: fromCents(toCents(existingTransaction.balance_after)),
        currency: "INR",
        alreadyProcessed: true,
      };
    }

    // 7. Calculate debit
    const beforeCents = toCents(account.available_balance);
    const debitCents = toCents(amount);

    if (beforeCents < debitCents) {
      throw ApiError.conflict("Insufficient wallet balance");
    }

    const afterCents = beforeCents - debitCents;

    const balanceBefore = fromCents(beforeCents);
    const balanceAfter = fromCents(afterCents);
    const normalizedAmount = fromCents(debitCents);

    // 8. Update balance
    await updateAvailableBalance(account.id, balanceAfter, connection);

    // 9. Insert debit transaction
    const transactionResult = await insertWalletTransaction(
      {
        companyId: Number(companyId),
        account_id: account.id,
        transaction_type: "DEBIT",
        amount: normalizedAmount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_type: "SESSION_DEBIT",
        reference_id: normalizedReference,
        description:
          description?.trim() || "Wallet debited for EV charging session",
        created_by: "INTERNAL_API",
      },
      connection,
    );

    await connection.commit();

    return {
      transactionId: transactionResult.insertId,
      companyId: Number(companyId),
      transactionType: "DEBIT",
      amount: normalizedAmount,
      previousBalance: balanceBefore,
      currentBalance: balanceAfter,
      currency: "INR",
      alreadyProcessed: false,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getWalletBalance = async (companyId) => {
  const company = await getCompanyBillingType(companyId);

  if (!company) {
    throw ApiError.notFound("Company not found");
  }

  const account = await getAccountByCompanyId(companyId);

  if (!account) {
    throw ApiError.notFound("Company wallet account not found");
  }

  return {
    companyId: Number(companyId),
    billingType: company.billing_type,
    availableBalance: account.available_balance,
    reservedBalance: account.reserved_balance,
    creditLimit: account.credit_limit,
    outstandingBalance: account.outstanding_balance,
    status: account.status,
    currency: "INR",
  };
};

const listWalletTransactions = async (companyId, page = 1, limit = 20, filters = {}) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const company = await getCompanyBillingType(companyId);
  if (!company) throw ApiError.notFound("Company not found");
  if (company.billing_type !== "PREPAID") {
    throw ApiError.badRequest("Transaction history is only available for PREPAID companies");
  }
  const [result, summary] = await Promise.all([getWalletTransactions(companyId, {
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
    search: filters.search,
    startDate: filters.startDate,
    endDate: filters.endDate,
    transactionType: filters.transactionType,
  }), getWalletTransactionSummary(companyId)]);
  return {
    transactions: result.rows,
    summary: { totalUsage: String(summary.totalUsage), totalCredits: String(summary.totalCredits) },
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: result.total,
      totalPages: Math.ceil(result.total / safeLimit),
    },
  };
};

export {
  creditPrepaidWallet,
  debitPrepaidWallet,
  getWalletBalance,
  listWalletTransactions,
};
