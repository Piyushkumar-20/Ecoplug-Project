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

  const payments = await getInvoicePayments(invoiceId);
  return { ...rows[0], items, payments };
};


const getInvoiceForUpdate = async (companyId, invoiceId, connection) => {
  const [rows] = await connection.query(
    `SELECT id, company_id, total_amount, paid_amount, due_date, status
     FROM invoices
     WHERE company_id = ? AND id = ?
     LIMIT 1
     FOR UPDATE`,
    [companyId, invoiceId],
  );
  return rows[0] ?? null;
};

const getPaymentByReference = async (companyId, transactionReference, connection) => {
  const [rows] = await connection.query(
    `SELECT id, invoice_id, amount, payment_method
     FROM payment_records
     WHERE company_id = ? AND transaction_reference = ?
     LIMIT 1`,
    [companyId, transactionReference],
  );
  return rows[0] ?? null;
};

const insertPaymentRecord = async (payment, connection) => {
  const [result] = await connection.query(
    `INSERT INTO payment_records
      (company_id, invoice_id, amount, payment_method, transaction_reference,
       payment_date, notes, recorded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payment.companyId,
      payment.invoiceId,
      payment.amount,
      payment.paymentMethod,
      payment.transactionReference,
      payment.paymentDate,
      payment.notes ?? null,
      payment.recordedBy ?? null,
    ],
  );
  return result;
};

const updateInvoicePayment = async (invoiceId, paidAmount, connection) => {
  await connection.query(
    `UPDATE invoices
     SET paid_amount = ?,
         status = CASE
           WHEN ? >= total_amount THEN 'PAID'
           WHEN due_date < CURDATE() THEN 'OVERDUE'
           ELSE 'PARTIALLY_PAID'
         END
     WHERE id = ?`,
    [paidAmount, paidAmount, invoiceId],
  );
};

const decreaseOutstandingBalance = async (accountId, amount, connection) => {
  const [result] = await connection.query(
    `UPDATE company_accounts
     SET outstanding_balance = outstanding_balance - ?
     WHERE id = ? AND outstanding_balance >= ?`,
    [amount, accountId, amount],
  );
  return result;
};

const getInvoicePayments = async (invoiceId) => {
  const [rows] = await db.query(
    `SELECT id, amount, payment_method AS paymentMethod,
            transaction_reference AS transactionReference,
            payment_date AS paymentDate, notes, recorded_by AS recordedBy,
            created_at AS createdAt
     FROM payment_records
     WHERE invoice_id = ?
     ORDER BY payment_date DESC, id DESC`,
    [invoiceId],
  );
  return rows;
};

export {
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
  getInvoicePayments,
};
