import {
  getComplaintsByCompanyId,
  getComplaintSummaryByCompanyId,
  getComplaintByIdAndCompanyId,
  getComplaintNotesById,
} from "../models/complaints.model.js";

const formatTat = (totalMinutes) => {
  const minutes = Math.max(0, Number(totalMinutes) || 0);

  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const remainingMinutes = minutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

const getComplaints = async (companyId, filters = {}, pagination = {}) => {
  const result = await getComplaintsByCompanyId(companyId, filters, pagination);
  const summary = await getComplaintSummaryByCompanyId(companyId);

  return {
    ...result,
    rows: result.rows.map((complaint) => ({
      ...complaint,
      tat: formatTat(complaint.tatMinutes),
    })),
    summary,
  };
};

const getComplaintNotes = async (complaintId) => {
  return getComplaintNotesById(complaintId);
};

const getComplaintDetails = async (complaintId, companyId) => {
  const complaint = await getComplaintByIdAndCompanyId(complaintId, companyId);

  if (!complaint) {
    return null;
  }

  const notes = await getComplaintNotes(complaintId);

  return {
    ...complaint,
    tat: formatTat(complaint.tatMinutes),
    notes,
  };
};

export { getComplaints, getComplaintDetails, getComplaintNotes };
