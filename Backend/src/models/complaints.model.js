import db from "../config/db.js";

const getComplaintsByCompanyId = async (companyId, filters = {}) => {
  const conditions = ["c.company_id = ?"];
  const params = [companyId];

  const { status, priority, emsp, complaintType, fromDate, toDate, search } =
    filters;

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

  if (search) {
    conditions.push(`(
          c.external_complaint_id LIKE ?
          OR c.customer_name LIKE ?
          OR c.customer_email LIKE ?
          OR c.customer_phone LIKE ?
          OR c.station_name LIKE ?
          OR c.charger_name LIKE ?
        )`);

    const searchTerm = `%${search}%`;

    params.push(
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
    );
  }
  const sql = `
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
  WHERE ${conditions.join(" AND ")}
  ORDER BY c.raised_at DESC, c.id DESC
`;

  const [rows] = await db.query(sql, params);
  return rows;
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

export { getComplaintsByCompanyId, getComplaintByIdAndCompanyId, getComplaintNotesById};
