import { getComplaints } from "../services/complaints.service.js";

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

export { getComplaintsController };
