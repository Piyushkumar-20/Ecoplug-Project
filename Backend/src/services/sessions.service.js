import {
  getSessionsByCompanyId,
  getSessionById,
} from "../models/sessions.model.js";
import ApiError from "../utils/api-error.js";

const getSessions = async (companyId, filters = {}) => {
  if (!companyId) {
    throw ApiError.notFound("Company Id not found");
  }
  return await getSessionsByCompanyId(companyId, filters);
};

const getSessionDetails = async (sessionId, companyId) => {
  if (!sessionId) {
    throw ApiError.notFound("Session Id not Found");
  }
  if (!companyId) {
    throw ApiError.badGateway("Company Id is required");
  }

  const session = await getSessionById(sessionId, companyId);
  if (!session) {
    throw ApiError.notFound("Session Id not Found");
  }

  return session;
};

export { getSessions, getSessionDetails };
