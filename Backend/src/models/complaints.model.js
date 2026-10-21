import db from "../config/db.js";

const buildComplaintConditions = (companyId, filters = {}) => {
  const conditions = ["c.company_id = ?"];
  const params = [companyId];

  const {
    status,
    priority,
    emsp,
    complaintType,
    fromDate,
    toDate,
    search,
    sessionId,
  } = filters;

  if (status) {
    conditions.push("c.status = ?");
    params.push(status);
  }

  if (priority) {
    conditions.push("c.priority = ?");
    params.push(priority);
  }

  if (emsp) {
    conditions.push("c.emsp = ?");
    params.push(emsp);
  }

  if (complaintType) {
    conditions.push("c.complaint_type = ?");
    params.push(complaintType);
  }

  if (fromDate) {
    conditions.push("c.raised_at >= ?");
    params.push(`${fromDate} 00:00:00`);
  }

  if (toDate) {
    conditions.push("c.raised_at < DATE_ADD(?, INTERVAL 1 DAY)");
    params.push(toDate);
  }

  if (sessionId) {
    conditions.push("CAST(c.session_id AS CHAR) LIKE ?");
    params.push(`%${sessionId}%`);
  }

  if (search) {
    conditions.push(`(
      c.external_complaint_id LIKE ?
      OR CAST(c.id AS CHAR) LIKE ?
      OR c.customer_name LIKE ?
      OR c.customer_email LIKE ?
      OR c.customer_phone LIKE ?
      OR c.station_name LIKE ?
      OR c.charger_name LIKE ?
      OR c.emsp LIKE ?
      OR c.complaint_type LIKE ?
      OR c.sub_type LIKE ?
    )`);

    const searchTerm = `%${search}%`;
    params.push(
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
    );
  }

  return { conditions, params };
};

const getComplaintsByCompanyId = async (companyId, filters = {}, pagination = {}) => {
  const { conditions, params } = buildComplaintConditions(companyId, filters);
  const page = Math.max(1, Number.parseInt(pagination.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(pagination.pageSize, 10) || 10));
  const offset = (page - 1) * pageSize;
  const whereClause = conditions.join(" AND ");

  const [rows] = await db.query(
    `
      SELECT
        c.id,
        c.external_complaint_id AS complaintId,
        c.session_id AS sessionId,
        c.emsp,
        c.charger_name AS chargerName,
        c.station_name AS stationName,
        c.complaint_type AS complaintType,
        c.sub_type AS subType,
        c.priority,
        c.status,
        c.customer_name AS customerName,
        c.customer_phone AS customerPhone,
        c.customer_email AS customerEmail,
        c.vehicle,
        c.raised_at AS raisedAt,
        c.resolved_at AS resolvedAt,
        CASE
          WHEN c.resolved_at IS NOT NULL THEN
            TIMESTAMPDIFF(MINUTE, c.raised_at, c.resolved_at)
          ELSE
            TIMESTAMPDIFF(MINUTE, c.raised_at, NOW())
        END AS tatMinutes
      FROM complaints AS c
      WHERE ${whereClause}
      ORDER BY c.raised_at DESC, c.id DESC
      LIMIT ? OFFSET ?
    `,
    [...params, pageSize, offset],
  );

  const [[countRow]] = await db.query(
    `SELECT COUNT(*) AS total FROM complaints AS c WHERE ${whereClause}`,
    params,
  );

  return {
    rows,
    total: Number(countRow?.total || 0),
    page,
    pageSize,
  };
};

const getComplaintSummaryByCompanyId = async (companyId) => {
  const [[summary]] = await db.query(
    `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inProgress,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved
      FROM complaints
      WHERE company_id = ?
    `,
    [companyId],
  );

  return {
    total: Number(summary?.total || 0),
    open: Number(summary?.open || 0),
    inProgress: Number(summary?.inProgress || 0),
    resolved: Number(summary?.resolved || 0),
  };
};

const getComplaintByIdAndCompanyId = async (complaintId, companyId) => {
  const [rows] = await db.query(
    `
      SELECT
        c.id,
        c.external_complaint_id AS complaintId,
        c.session_id AS sessionId,
        c.emsp,
        c.charger_name AS chargerName,
        c.station_name AS stationName,
        c.complaint_type AS complaintType,
        c.sub_type AS subType,
        c.priority,
        c.status,
        c.customer_name AS customerName,
        c.customer_phone AS customerPhone,
        c.customer_email AS customerEmail,
        c.vehicle,
        c.raised_at AS raisedAt,
        c.resolved_at AS resolvedAt,
        CASE
          WHEN c.resolved_at IS NOT NULL THEN
            TIMESTAMPDIFF(MINUTE, c.raised_at, c.resolved_at)
          ELSE
            TIMESTAMPDIFF(MINUTE, c.raised_at, NOW())
        END AS tatMinutes
      FROM complaints AS c
      WHERE c.id = ? AND c.company_id = ?
      LIMIT 1
    `,
    [complaintId, companyId],
  );

  return rows[0] || null;
};

const getComplaintNotesById = async (complaintId) => {
  const [rows] = await db.query(
    `
      SELECT
        id,
        complaint_id AS complaintId,
        sender,
        note_text AS noteText,
        created_at AS createdAt
      FROM complaint_notes
      WHERE complaint_id = ?
      ORDER BY created_at ASC, id ASC
    `,
    [complaintId],
  );
  return rows;
};

export {
  getComplaintsByCompanyId,
  getComplaintSummaryByCompanyId,
  getComplaintByIdAndCompanyId,
  getComplaintNotesById,
};
