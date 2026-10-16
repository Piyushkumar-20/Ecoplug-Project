import {
  getSessions,
  getSessionDetails,
} from "../services/sessions.service.js";

const isValidDate = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

const getSessionsController = async (req, res, next) => {
  try {
    // Company ID must come from authenticated user context.
    const companyId = req.user.companyId;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated company information is missing",
      });
    }

    const { page, limit, status, search, emsp, startDate, endDate } = req.query;

    // Validate date filters.
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate. Use YYYY-MM-DD format.",
      });
    }

    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid endDate. Use YYYY-MM-DD format.",
      });
    }

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be after endDate.",
      });
    }

    const filters = {
      page,
      limit,
      status: status?.trim(),
      search: search?.trim(),
      emsp: emsp?.trim(),
      startDate,
      endDate,
    };

    const result = await getSessions(companyId, filters);

    return res.status(200).json({
      success: true,
      message: "Sessions fetched successfully",
      data: result.sessions,
      pagination: result.pagination,

      // Used by the frontend eMSP dropdown.
      filters: {
        emspOptions: result.emspOptions ?? [],
      },
    });
  } catch (error) {
    next(error);
  }
};

const getSessionDetailsController = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { sessionId } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated company information is missing",
      });
    }

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
