import {
  getSessionsByCompanyId,
  getSessionById,
} from "../models/sessions.model.js";

const getSessions = async (companyId, filters = {}) => {
  if (!companyId) {
    throw new Error("Company ID is required");
  }

  return await getSessionsByCompanyId(companyId, filters);
};

const getSessionDetails = async (sessionId, companyId) => {
  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  if (!companyId) {
    throw new Error("Company ID is required");
  }

  const session = await getSessionById(sessionId, companyId);

  if (!session) {
    const error = new Error("Session not found");
    error.statusCode = 404;
    throw error;
  }

  return session;
};

export { getSessions, getSessionDetails };
