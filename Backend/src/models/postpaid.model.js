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

const getCompletedSessionsForPeriod = async (companyId, startDate, endDate) => {
  const [rows] = await db.query(
    `SELECT id
     FROM ocpi_sessions
     WHERE company_id = ?
       AND UPPER(status) = 'COMPLETED'
       AND end_date_time IS NOT NULL
       AND total_cost IS NOT NULL
       AND DATE(start_date_time) >= ?
       AND DATE(start_date_time) <= ?
     ORDER BY start_date_time ASC, id ASC`,
    [companyId, startDate, endDate],
  );
  return rows;
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

const getUninvoicedUsage = async (companyId, startDate, endDate, connection) => {
  const [rows] = await connection.query(
    `SELECT id, session_id, usage_date, amount, description
     FROM postpaid_usage
     WHERE company_id = ?
       AND usage_date >= ?
       AND usage_date <= ?
       AND id NOT IN (SELECT usage_id FROM invoice_items)
     ORDER BY usage_date ASC, id ASC
     FOR UPDATE`,
    [companyId, startDate, endDate],
  );
  return rows;
};

const findInvoiceForPeriod = async (companyId, startDate, endDate, connection) => {
  const [rows] = await connection.query(
    `SELECT id, invoice_number, status, total_amount, issue_date, due_date
     FROM invoices
     WHERE company_id = ? AND billing_period_start = ? AND billing_period_end = ?
     LIMIT 1`,
    [companyId, startDate, endDate],
  );
  return rows[0] ?? null;
};

const insertInvoice = async (invoice, connection) => {
  const [result] = await connection.query(
    `INSERT INTO invoices
      (company_id, invoice_number, billing_period_start, billing_period_end,
       subtotal, tax_amount, total_amount, paid_amount, issue_date, due_date, status)
     VALUES (?, ?, ?, ?, ?, 0.00, ?, 0.00, ?, ?, 'ISSUED')`,
    [invoice.companyId, invoice.invoiceNumber, invoice.periodStart,
      invoice.periodEnd, invoice.subtotal, invoice.totalAmount,
      invoice.issueDate, invoice.dueDate],
  );
  return result;
};

const insertInvoiceItems = async (invoiceId, usages, connection) => {
  if (!usages.length) return;
  const values = usages.map((usage) => [
    invoiceId, usage.id, usage.session_id,
    usage.description || `EV charging session #${usage.session_id}`,
    usage.amount,
  ]);
  await connection.query(
    `INSERT INTO invoice_items
      (invoice_id, usage_id, session_id, description, amount)
     VALUES ?`,
    [values],
  );
};

const listCompanyInvoices = async (companyId, { limit, offset }) => {
  const [rows] = await db.query(
    `SELECT id, invoice_number AS invoiceNumber,
            billing_period_start AS billingPeriodStart,
            billing_period_end AS billingPeriodEnd,
            subtotal, tax_amount AS taxAmount, total_amount AS totalAmount,
            paid_amount AS paidAmount, issue_date AS issueDate,
            due_date AS dueDate, status
     FROM invoices
     WHERE company_id = ?
     ORDER BY issue_date DESC, id DESC
     LIMIT ? OFFSET ?`,
    [companyId, limit, offset],
  );
  return rows;
};

const getCompanyInvoiceById = async (companyId, invoiceId) => {
  const [rows] = await db.query(
    `SELECT id, company_id AS companyId, invoice_number AS invoiceNumber,
            billing_period_start AS billingPeriodStart,
            billing_period_end AS billingPeriodEnd,
            subtotal, tax_amount AS taxAmount, total_amount AS totalAmount,
            paid_amount AS paidAmount, issue_date AS issueDate,
            due_date AS dueDate, status
     FROM invoices
     WHERE company_id = ? AND id = ? LIMIT 1`,
    [companyId, invoiceId],
  );
  if (!rows[0]) return null;

  const [items] = await db.query(
    `SELECT id, session_id AS sessionId, description, amount
     FROM invoice_items
     WHERE invoice_id = ?
     ORDER BY id ASC`,
    [invoiceId],
  );

  return { ...rows[0], items };
};

export {
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
};
