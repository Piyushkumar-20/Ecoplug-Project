import { getDashboardByCompanyId } from "../models/dashboard.model.js";

const getDashboard = async (companyId) => {
  if (companyId === undefined || companyId === null || companyId === "") {
    const error = new Error("Company ID is required");
    error.statusCode = 400;
    throw error;
  }

  return getDashboardByCompanyId(companyId);
};

export { getDashboard };
