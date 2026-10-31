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

const listCompanyPostpaidUsage = async (companyId, { limit, offset, search, startDate, endDate }) => {
  const conditions = ["pu.company_id = ?"];
  const params = [companyId];
  if (startDate) { conditions.push("pu.usage_date >= ?"); params.push(startDate); }
  if (endDate) { conditions.push("pu.usage_date <= ?"); params.push(endDate); }
  if (search) {
    conditions.push("(CAST(s.id AS CHAR) LIKE ? OR s.session_id LIKE ? OR l.name LIKE ? OR e.evse_id LIKE ?)");
    const term = `%${String(search).trim()}%`;
    params.push(term, term, term, term);
  }
  const [rows] = await db.query(
    `SELECT pu.id, pu.session_id AS sessionId, pu.usage_date AS usageDate,
            pu.amount, pu.currency, pu.description, pu.created_at AS recordedAt,
            l.name AS location, e.evse_id AS chargerId, s.status
     FROM postpaid_usage pu
     LEFT JOIN ocpi_sessions s ON s.id = pu.session_id AND s.company_id = pu.company_id
     LEFT JOIN ocpi_roaming_locations l ON l.id = s.location_id AND l.company_id = s.company_id
     LEFT JOIN ocpi_roaming_evses e ON e.uid = s.evse_uid AND e.location_id = l.id
     WHERE ${conditions.join(" AND ")}
     ORDER BY pu.usage_date DESC, pu.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return rows;
};

const countCompanyPostpaidUsage = async (companyId, { search, startDate, endDate } = {}) => {
  const conditions = ["pu.company_id = ?"];
  const params = [companyId];
  if (startDate) { conditions.push("pu.usage_date >= ?"); params.push(startDate); }
  if (endDate) { conditions.push("pu.usage_date <= ?"); params.push(endDate); }
  if (search) {
    conditions.push("(CAST(s.id AS CHAR) LIKE ? OR s.session_id LIKE ? OR l.name LIKE ? OR e.evse_id LIKE ?)");
    const term = `%${String(search).trim()}%`;
    params.push(term, term, term, term);
  }
  const [rows] = await db.query(
    `SELECT COUNT(*) AS total
     FROM postpaid_usage pu
     LEFT JOIN ocpi_sessions s ON s.id = pu.session_id AND s.company_id = pu.company_id
     LEFT JOIN ocpi_roaming_locations l ON l.id = s.location_id AND l.company_id = s.company_id
     LEFT JOIN ocpi_roaming_evses e ON e.uid = s.evse_uid AND e.location_id = l.id
     WHERE ${conditions.join(" AND ")}`,
    params,
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
