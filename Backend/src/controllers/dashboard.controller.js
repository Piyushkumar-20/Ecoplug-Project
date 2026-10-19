import { getDashboard } from "../services/dashboard.service.js";
import ApiResponse from "../utils/api-response.js"

const getDashboardController = async (req, res, next) => {
  try {
    const data = await getDashboard(req.user.companyId);

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export { getDashboardController };
