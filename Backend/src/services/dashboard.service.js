import { getDashboardByCompanyId } from "../models/dashboard.model.js";
import ApiError from "../utils/api-error.js";

const getDashboard = async (companyId) => {
  if (companyId === undefined || companyId === null || companyId === "") {
    throw ApiError.badGateway("Company Id is required");
  }

  return getDashboardByCompanyId(companyId);
};

export { getDashboard };
