import {
  createNotification,
  getNotifications,
} from "../models/notification.model.js";

export const createAndEmitNotification = async ({
  io,
  companyId,
  type,
  title,
  message,
  entityId,
}) => {
  const notificationId = await createNotification({
    companyId,
    type,
    title,
    message,
    entityId,
  });

  const notification = {
    id: notificationId,
    company_id: companyId,
    type,
    title,
    message,
    entity_id: String(entityId),
    is_read: false,
    created_at: new Date(),
  };

  io.to(`company:${companyId}`).emit("notification:new", notification);
  console.log(`Notification emitted to company:${companyId}`);


  return notification;
};

export const fetchNotifications = async ({ companyId, limit, offset }) => {
  return getNotifications({
    companyId,
    limit,
    offset,
  });
};
