import {
  fetchNotifications,
  markNotificationAsRead,
  markCompanyNotificationsRead,
} from "../services/notification.service.js";
import ApiError from "../utils/api-error.js";

const getCompanyId = (req) => {
  const companyId = Number(req.user?.companyId);
  if (!Number.isSafeInteger(companyId) || companyId <= 0) {
    throw ApiError.unauthorized("Authenticated company not found");
  }
  return companyId;
};

export const getNotifications = async (req, res) => {
  const companyId = getCompanyId(req);
  const rawLimit = req.query.limit ?? "20";
  const rawOffset = req.query.offset ?? "0";

  if (!/^\d+$/.test(String(rawLimit)) || !/^\d+$/.test(String(rawOffset))) {
    throw ApiError.badRequest("Limit and offset must be non-negative integers");
  }

  const limit = Number(rawLimit);
  const offset = Number(rawOffset);

  if (limit < 1 || limit > 100 || !Number.isSafeInteger(offset)) {
    throw ApiError.badRequest("Limit must be 1–100 and offset must be valid");
  }

  const notifications = await fetchNotifications({ companyId, limit, offset });
  return res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
};

export const markNotificationReadController = async (req, res) => {
  const companyId = getCompanyId(req);
  const notificationId = Number(req.params.id);

  if (!Number.isSafeInteger(notificationId) || notificationId <= 0) {
    throw ApiError.badRequest("Invalid notification ID");
  }

  const updated = await markNotificationAsRead({ companyId, notificationId });

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: "Notification not found for this company",
    });
  }

  return res.status(200).json({ success: true, message: "Notification marked as read" });
};

export const markAllNotificationsReadController = async (req, res) => {
  const companyId = getCompanyId(req);
  const updatedCount = await markCompanyNotificationsRead({ companyId });

  return res.status(200).json({
    success: true,
    message: "Notifications marked as read",
    updatedCount,
  });
};
