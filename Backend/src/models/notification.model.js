
import db from "../config/db.js";

const createNotification = async ({
  companyId,
  type,
  title,
  message,
  entityId,
}) => {
  const [result] = await db.query(
    `INSERT INTO notifications
      (company_id, type, title, message, entity_id)
     VALUES (?, ?, ?, ?, ?)`,
    [companyId, type, title, message, String(entityId)]
  );

  return result.insertId;
};

const getNotifications = async ({
  companyId,
  limit = 20,
  offset = 0,
}) => {
  const [rows] = await db.query(
    `SELECT id, type, title, message, entity_id,
            is_read, created_at
     FROM notifications
     WHERE company_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT ? OFFSET ?`,
    [companyId, Number(limit), Number(offset)]
  );

  return rows;
};

export {createNotification, getNotifications}