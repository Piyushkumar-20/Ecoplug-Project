import db from "../config/db.js";

const createNotification = async ({
  companyId,
  type,
  title,
  message,
  entityId,
  sourceKey = null,
}) => {
  try {
    const [result] = await db.query(
      `INSERT INTO notifications
        (company_id, type, title, message, entity_id, source_key)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        Number(companyId),
        type,
        title,
        message,
        String(entityId),
        sourceKey,
      ],
    );

    return { id: result.insertId, created: true };
  } catch (error) {
    // Idempotency: the same source event may be retried after a crash.
    if (error.code !== "ER_DUP_ENTRY" || !sourceKey) throw error;

    const [rows] = await db.query(
      `SELECT id
       FROM notifications
       WHERE company_id = ? AND source_key = ?
       LIMIT 1`,
      [Number(companyId), sourceKey],
    );

    if (!rows.length) throw error;
    return { id: rows[0].id, created: false };
  }
};

const getNotifications = async ({ companyId, limit = 20, offset = 0 }) => {
  const [rows] = await db.query(
    `SELECT id, type, title, message, entity_id,
            is_read, created_at
     FROM notifications
     WHERE company_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT ? OFFSET ?`,
    [Number(companyId), Number(limit), Number(offset)],
  );

  return rows;
};

const markNotificationRead = async ({ companyId, notificationId }) => {
  const [result] = await db.query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE id = ? AND company_id = ?`,
    [Number(notificationId), Number(companyId)],
  );
  return result.affectedRows > 0;
};

const markAllNotificationsRead = async ({ companyId }) => {
  const [result] = await db.query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE company_id = ? AND is_read = FALSE`,
    [Number(companyId)],
  );
  return result.affectedRows;
};

export {
  createNotification,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
