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

const getWalletTransactions = async (companyId, { limit, offset, search, startDate, endDate, transactionType }) => {
  const conditions = ["company_id = ?"];
  const params = [companyId];
  if (transactionType) { conditions.push("transaction_type = ?"); params.push(transactionType); }
  if (startDate) { conditions.push("DATE(created_at) >= ?"); params.push(startDate); }
  if (endDate) { conditions.push("DATE(created_at) <= ?"); params.push(endDate); }
  if (search) {
    conditions.push("(description LIKE ? OR reference_id LIKE ? OR CAST(id AS CHAR) LIKE ?)");
    const term = `%${String(search).trim()}%`;
    params.push(term, term, term);
  }
  const where = conditions.join(" AND ");
  const [rows] = await db.query(
    `SELECT id, transaction_type AS transactionType, amount,
            balance_before AS balanceBefore, balance_after AS balanceAfter,
            reference_type AS referenceType, reference_id AS referenceId,
            description, created_by AS createdBy, created_at AS createdAt
     FROM wallet_transactions WHERE ${where}
     ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total FROM wallet_transactions WHERE ${where}`,
    params,
  );
  return { rows, total: Number(countRows[0]?.total ?? 0) };
};
const getWalletTransactionSummary = async (companyId) => {
  const [rows] = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN transaction_type = 'DEBIT' THEN amount ELSE 0 END), 0) AS totalUsage,
       COALESCE(SUM(CASE WHEN transaction_type = 'CREDIT' THEN amount ELSE 0 END), 0) AS totalCredits
     FROM wallet_transactions
     WHERE company_id = ?`,
    [companyId],
  );
  return rows[0] ?? { totalUsage: 0, totalCredits: 0 };
};


export {
  getCompanyBillingType,
  getAccountByCompanyId,
  insertWalletTransaction,
  getWalletTransactionByReference,
  updateAvailableBalance,
  getWalletTransactions,
  getWalletTransactionSummary,
};
