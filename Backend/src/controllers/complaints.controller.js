import {
  getComplaints,
  getComplaintDetails,
} from "../services/complaints.service.js";

const getComplaintsController = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated company not found",
      });
    }

    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      emsp: req.query.emsp,
      complaintType: req.query.complaintType,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      search: req.query.search,
    };

    const complaints = await getComplaints(companyId, filters);

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
    });
  }
};

const getComplaintDetailsController = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated company not found",
      });
    }

    if (!/^\d+$/.test(id) || Number(id) < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
    }

    const complaint = await getComplaintDetails(Number(id), companyId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    console.error("Error fetching complaint details:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaint details",
    });
  }
};

export { getComplaintsController, getComplaintDetailsController };
