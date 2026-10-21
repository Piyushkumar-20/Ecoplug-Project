import {
  getComplaints,
  getComplaintDetails,
} from "../services/complaints.service.js";
import ApiError from "../utils/api-error.js";

const getComplaintsController = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      throw ApiError.unauthorized("Authenticated company not found");
    }

    const filters = {
      status: req.query.status || undefined,
      priority: req.query.priority || undefined,
      emsp: req.query.emsp || undefined,
      complaintType: req.query.complaintType || undefined,
      fromDate: req.query.fromDate || undefined,
      toDate: req.query.toDate || undefined,
      search: req.query.search?.trim() || undefined,
      sessionId: req.query.sessionId?.trim() || undefined,
    };

    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedPageSize = Number.parseInt(req.query.pageSize, 10);
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const pageSize = Number.isFinite(requestedPageSize) && requestedPageSize > 0
      ? Math.min(requestedPageSize, 100)
      : 10;

    if (
      (filters.fromDate && Number.isNaN(Date.parse(filters.fromDate))) ||
      (filters.toDate && Number.isNaN(Date.parse(filters.toDate)))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date filter. Use YYYY-MM-DD.",
      });
    }

    const result = await getComplaints(companyId, filters, { page, pageSize });
    const totalPages = Math.ceil(result.total / result.pageSize);

    return res.status(200).json({
      success: true,
      count: result.total,
      data: result.rows,
      summary: result.summary,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages,
        hasPreviousPage: result.page > 1,
        hasNextPage: result.page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw ApiError.internal("Failed to fetch complaints");
  }
};

const getComplaintDetailsController = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      throw ApiError.unauthorized("Authenticated company not found");
    }

    if (!/^\\d+$/.test(id) || Number(id) < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
    }

    const complaint = await getComplaintDetails(Number(id), companyId);

    if (!complaint) {
      throw ApiError.notFound("Complaint not found!");
    }

    return res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    console.error("Error fetching complaint details:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw ApiError.internal("Failed to fetch complaint details");
  }
};

export { getComplaintsController, getComplaintDetailsController };
