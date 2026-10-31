import db from "../config/db.js";

const getCompanyBillingType = async (companyId, connection = db) => {
  const [rows] = await connection.query(
    `SELECT billing_type
     FROM companies
     WHERE id = ?
     LIMIT 1`,
    [companyId],
  );

  return rows[0] ?? null;
};

const getAccountByCompanyId = async (
  companyId,
  connection = db,
  lock = false,
) => {
  const [rows] = await connection.query(
    `SELECT
       id,
       company_id,
       available_balance,
       reserved_balance,
       outstanding_balance,
       credit_limit,
       status
     FROM company_accounts
     WHERE company_id = ?
     LIMIT 1${lock ? " FOR UPDATE" : ""}`,
    [companyId],
  );

  return rows[0] ?? null;
};

const insertWalletTransaction = async (transaction, connection) => {
  const [result] = await connection.query(
    `INSERT INTO wallet_transactions
      (
        company_id,
        account_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        reference_type,
        reference_id,
        description,
        created_by
      )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transaction.companyId,
      transaction.account_id,
      transaction.transaction_type,
      transaction.amount,
      transaction.balance_before,
      transaction.balance_after,
      transaction.reference_type ?? null,
      transaction.reference_id ?? null,
      transaction.description ?? null,
      transaction.created_by ?? null,
    ],
  );

  return result;
};

const updateAvailableBalance = async (accountId, balance, connection) => {
  await connection.query(
    `UPDATE company_accounts
     SET available_balance = ?
     WHERE id = ?`,
    [balance, accountId],
  );
};

const getWalletTransactionByReference = async (
  companyId,
  referenceType,
  referenceId,
  connection = db,
) => {
  const [rows] = await connection.query(
    `SELECT
       id,
       transaction_type,
       amount,
       balance_before,
       balance_after
     FROM wallet_transactions
     WHERE company_id = ?
       AND reference_type = ?
       AND reference_id = ?
     LIMIT 1`,
    [companyId, referenceType, referenceId],
  );

  return rows[0] ?? null;
};

const getWalletTransactions = async (companyId, { limit, offset }) => {
  const [rows] = await db.query(
    `SELECT
       id,
       transaction_type AS transactionType,
       amount,
       balance_before AS balanceBefore,
       balance_after AS balanceAfter,
       reference_type AS referenceType,
       reference_id AS referenceId,
       description,
       created_by AS createdBy,
       created_at AS createdAt
     FROM wallet_transactions
     WHERE company_id = ?
     ORDER BY id DESC
     LIMIT ? OFFSET ?`,
    [companyId, limit, offset],
  );

  return rows;
};

export {
  getCompanyBillingType,
  getAccountByCompanyId,
  insertWalletTransaction,
  getWalletTransactionByReference,
  updateAvailableBalance,
  getWalletTransactions,
};
