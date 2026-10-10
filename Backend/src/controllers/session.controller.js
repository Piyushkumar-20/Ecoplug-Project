import {
  getSessions,
  getSessionDetails,
} from "../services/sessions.service.js";

const getSessionsController = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      search: req.query.search,
    };

    const result = await getSessions(companyId, filters);

    return res.status(200).json({
      success: true,
      message: "Sessions fetched successfully",
      data: result.sessions,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getSessionDetailsController = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { sessionId } = req.params;

    const session = await getSessionDetails(sessionId, companyId);

    return res.status(200).json({
      success: true,
      message: "Session details fetched successfully",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export { getSessionsController, getSessionDetailsController };
