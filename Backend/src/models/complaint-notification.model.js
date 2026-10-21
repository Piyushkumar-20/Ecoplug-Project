import db from "../config/db.js";

const CHECKPOINT_KEY = "new_complaints";

export const getOrInitializeComplaintCheckpoint = async () => {
  // Initialize only once. Restarts never reset the checkpoint to MAX(id).
  await db.query(
    `INSERT IGNORE INTO notification_polling_checkpoints
       (checkpoint_key, last_processed_id)
     SELECT ?, COALESCE(MAX(id), 0)
     FROM complaints`,
    [CHECKPOINT_KEY],
  );

  const [rows] = await db.query(
    `SELECT last_processed_id AS lastProcessedId
     FROM notification_polling_checkpoints
     WHERE checkpoint_key = ?`,
    [CHECKPOINT_KEY],
  );

  if (!rows.length) {
    throw new Error("Complaint notification checkpoint could not be initialized");
  }

  return Number(rows[0].lastProcessedId);
};

export const getNewComplaintsAfterId = async (lastId, limit = 100) => {
  const [rows] = await db.query(
    `SELECT
       id,
       company_id AS companyId,
       external_complaint_id AS complaintId,
       station_name AS stationName,
       charger_name AS chargerName
     FROM complaints
     WHERE id > ?
     ORDER BY id ASC
     LIMIT ?`,
    [Number(lastId), Number(limit)],
  );

  return rows;
};

export const saveComplaintCheckpoint = async (complaintId) => {
  await db.query(
    `UPDATE notification_polling_checkpoints
     SET last_processed_id = GREATEST(last_processed_id, ?)
     WHERE checkpoint_key = ?`,
    [Number(complaintId), CHECKPOINT_KEY],
  );
};
