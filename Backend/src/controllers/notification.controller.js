import { fetchNotifications } from "../services/notification.service.js";
import ApiError from "../utils/api-error.js";

const getNotifications = async (req, res) => {
  const companyId = Number(req.user?.companyId);

  if (!Number.isInteger(companyId) || companyId <= 0) {
    throw ApiError.unauthorized("Authenticated company not found");
  }

  const rawLimit = req.query.limit ?? "20";
  const rawOffset = req.query.offset ?? "0";

  if (!/^\d+$/.test(String(rawLimit)) || !/^\d+$/.test(String(rawOffset))) {
    return res.status(400).json({
      success: false,
      message: "Limit and offset must be valid non-negative integers",
    });
  }

  const limit = Number(rawLimit);
  const offset = Number(rawOffset);

  if (limit < 1 || limit > 100 || !Number.isSafeInteger(offset)) {
    return res.status(400).json({
      success: false,
      message: "Limit must be 1–100 and offset must be valid",
    });
  }

  const notifications = await fetchNotifications({
    companyId,
    limit,
    offset,
  });

  return res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
};

export { getNotifications };
