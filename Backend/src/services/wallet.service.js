
import db from "../config/db.js";
import ApiError from "../utils/api-error.js";

import {
  getCompanyBillingType,
  getAccountByCompanyId,
  insertWalletTransaction,
  updateAvailableBalance,
  getWalletTransactions,
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
  // Validate company ID
  if (
    !Number.isSafeInteger(Number(companyId)) ||
    Number(companyId) <= 0
  ) {
    throw ApiError.badRequest("A valid companyId is required");
  }

  // Validate amount
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isFinite(toCents(amount)) ||
    toCents(amount) <= 0
  ) {
    throw ApiError.badRequest(
      "amount must be a positive number with up to two decimal places"
    );
  }

  if (
    Math.abs(amount * 100 - Math.round(amount * 100)) >
    0.000001
  ) {
    throw ApiError.badRequest(
      "amount can have at most two decimal places"
    );
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Check company existence and billing type
    const company = await getCompanyBillingType(
      companyId,
      connection
    );

    if (!company) {
      throw ApiError.notFound("Company not found");
    }

    if (company.billing_type !== "PREPAID") {
      throw ApiError.badRequest(
        "Wallet credits are only allowed for PREPAID companies"
      );
    }

    // 2. Fetch and lock company account
    const account = await getAccountByCompanyId(
      companyId,
      connection,
      true
    );

    if (!account) {
      throw ApiError.notFound(
        "Company wallet account not found"
      );
    }

    if (account.status !== "ACTIVE") {
      throw ApiError.forbidden(
        "Company wallet account is not active"
      );
    }

    // 3. Calculate new balance
    const beforeCents = toCents(account.available_balance);
    const creditCents = toCents(amount);
    const afterCents = beforeCents + creditCents;

    if (!Number.isSafeInteger(afterCents)) {
      throw ApiError.badRequest(
        "Wallet balance exceeds the supported limit"
      );
    }

    const balanceBefore = fromCents(beforeCents);
    const balanceAfter = fromCents(afterCents);
    const normalizedAmount = fromCents(creditCents);

    // 4. Update wallet balance
    await updateAvailableBalance(
      account.id,
      balanceAfter,
      connection
    );

    // 5. Insert transaction history
    const transactionResult = await insertWalletTransaction(
      {
        companyId: Number(companyId),
        account_id: account.id,
        transaction_type: "CREDIT",
        amount: normalizedAmount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_type: reference
          ? "ADMIN_REFERENCE"
          : "ADMIN_CREDIT",
        reference_id: reference || null,
        description:
          description?.trim() ||
          "Wallet credited by EcoPlug internal operator",
        created_by: "INTERNAL_API",
      },
      connection
    );
    await connection.commit();

    return {
      transactionId: transactionResult.insertId,
      companyId: Number(companyId),
      amount: normalizedAmount,
      previousBalance: balanceBefore,
      currentBalance: balanceAfter,
      currency: "INR",
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
    throw ApiError.notFound(
      "Company wallet account not found"
    );
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

const listWalletTransactions = async (
  companyId,
  page = 1,
  limit = 20
) => {
  const safePage = Math.max(
    1,
    Number.parseInt(page, 10) || 1
  );

  const safeLimit = Math.min(
    100,
    Math.max(1, Number.parseInt(limit, 10) || 20)
  );

  const company = await getCompanyBillingType(companyId);

  if (!company) {
    throw ApiError.notFound("Company not found");
  }

  const transactions = await getWalletTransactions(
    companyId,
    {
      limit: safeLimit,
      offset: (safePage - 1) * safeLimit,
    }
  );

  return {
    transactions,
    pagination: {
      page: safePage,
      limit: safeLimit,
    },
  };
};

export {
  creditPrepaidWallet,
  getWalletBalance,
  listWalletTransactions,
};
