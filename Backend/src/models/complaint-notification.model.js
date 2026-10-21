import db from "../config/db.js";

export const getLatestComplaintId = async () => {
  const [rows] = await db.query(
    `SELECT COALESCE(MAX(id), 0) AS latestId
     FROM complaints`,
  );

  return Number(rows[0].latestId);
};

export const getNewComplaintsAfterId = async (lastId) => {
  const [rows] = await db.query(
    `SELECT
       id,
       company_id AS companyId,
       external_complaint_id AS complaintId,
       station_name AS stationName,
       charger_name AS chargerName,
       complaint_type AS complaintType,
       priority
     FROM complaints
     WHERE id > ?
     ORDER BY id ASC`,
    [lastId],
  );

  return rows;
};
