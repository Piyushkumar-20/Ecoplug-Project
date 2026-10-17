import db from "../config/db.js"

const getComplaintsByCompanyId = async (companyId) => {
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
      WHERE c.company_id = ?
      ORDER BY c.raised_at DESC, c.id DESC
      `,
    [companyId],
  );

  return rows;
};

export {getComplaintsByCompanyId}