import db from "../config/db.js";

const getSessionForPostpaidUsage = async (sessionId, companyId, connection = db) => {
  const [rows] = await connection.query(
    `SELECT id, company_id, DATE_FORMAT(start_date_time, '%Y-%m-%d') AS usageDate,
            end_date_time, status, total_cost, currency, session_id
     FROM ocpi_sessions
     WHERE id = ? AND company_id = ?
     LIMIT 1`,
    [sessionId, companyId],
  );
  return rows[0] ?? null;
};

const getPostpaidUsageBySession = async (companyId, sessionId, connection) => {
  const [rows] = await connection.query(
    `SELECT id, amount FROM postpaid_usage
     WHERE company_id = ? AND session_id = ? LIMIT 1`,
    [companyId, sessionId],
  );
  return rows[0] ?? null;
};

const insertPostpaidUsage = async (usage, connection) => {
  const [result] = await connection.query(
    `INSERT INTO postpaid_usage
      (company_id, account_id, session_id, usage_date, amount, currency, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [usage.companyId, usage.accountId, usage.sessionId, usage.usageDate,
      usage.amount, usage.currency, usage.description],
  );
  return result;
};

const increaseOutstandingBalance = async (accountId, amount, connection) => {
  await connection.query(
    `UPDATE company_accounts
     SET outstanding_balance = outstanding_balance + ?
     WHERE id = ?`,
    [amount, accountId],
  );
};

const listCompanyPostpaidUsage = async (companyId, { limit, offset }) => {
  const [rows] = await db.query(
    `SELECT id, session_id AS sessionId, usage_date AS usageDate,
            amount, currency, description, created_at AS recordedAt
     FROM postpaid_usage
     WHERE company_id = ?
     ORDER BY usage_date DESC, id DESC
     LIMIT ? OFFSET ?`,
    [companyId, limit, offset],
  );
  return rows;
};

const countCompanyPostpaidUsage = async (companyId) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS total
     FROM postpaid_usage
     WHERE company_id = ?`,
    [companyId],
  );
  return Number(rows[0]?.total ?? 0);
};

export {
  getSessionForPostpaidUsage,
  getPostpaidUsageBySession,
  insertPostpaidUsage,
  increaseOutstandingBalance,
  listCompanyPostpaidUsage,
  countCompanyPostpaidUsage,
};
