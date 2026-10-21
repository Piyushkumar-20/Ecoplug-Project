import {
  createNotification,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../models/notification.model.js";

const ALLOWED_TYPES = new Set([
  "CHARGER_OFFLINE",
  "CHARGER_ONLINE",
  "NEW_COMPLAINT",
]);

export const createAndEmitNotification = async ({
  io,
  companyId,
  type,
  title,
  message,
  entityId,
  sourceKey = null,
}) => {
  const normalizedCompanyId = Number(companyId);

  if (!io) throw new Error("Socket.IO instance is unavailable");
  if (!Number.isSafeInteger(normalizedCompanyId) || normalizedCompanyId <= 0) {
    throw new Error("Invalid notification company ID");
  }
  if (!ALLOWED_TYPES.has(type)) throw new Error("Invalid notification type");
  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Notification title is required");
  }
  if (typeof message !== "string" || !message.trim()) {
    throw new Error("Notification message is required");
  }
  if (entityId === undefined || entityId === null || String(entityId).length > 100) {
    throw new Error("Invalid notification entity ID");
  }

  const insert = await createNotification({
    companyId: normalizedCompanyId,
    type,
    title: title.trim(),
    message: message.trim(),
    entityId,
    sourceKey,
  });

  // A retried source event must not emit a second realtime event.
  if (!insert.created) {
    return { id: insert.id, created: false };
  }

  const notification = {
    id: insert.id,
    company_id: normalizedCompanyId,
    type,
    title: title.trim(),
    message: message.trim(),
    entity_id: String(entityId),
    is_read: false,
    created_at: new Date(),
  };

  io.to(`company:${normalizedCompanyId}`).emit("notification:new", notification);
  return { ...notification, created: true };
};

export const fetchNotifications = async ({ companyId, limit, offset }) =>
  getNotifications({ companyId, limit, offset });

export const markNotificationAsRead = async ({ companyId, notificationId }) =>
  markNotificationRead({ companyId, notificationId });

export const markCompanyNotificationsRead = async ({ companyId }) =>
  markAllNotificationsRead({ companyId });
