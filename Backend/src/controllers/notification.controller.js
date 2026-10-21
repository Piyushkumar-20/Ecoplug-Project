import {
  createAndEmitNotification,
  fetchNotifications,
} from "../services/notification.service.js";

export const getNotifications = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 20, 1),
      100,
    );

    const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);

    const notifications = await fetchNotifications({
      companyId,
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { type, title, message, entityId } = req.body;

    if (!type || !title || !message || entityId == null) {
      return res.status(400).json({
        success: false,
        message: "type, title, message and entityId are required",
      });
    }

    const io = req.app.get("io");

    if (!io) {
      return res.status(500).json({
        success: false,
        message: "Socket.IO server is unavailable",
      });
    }

    const notification = await createAndEmitNotification({
      io,
      companyId: req.user.companyId,
      type,
      title,
      message,
      entityId,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};
