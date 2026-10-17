import {
  getComplaintsByCompanyId,
  getComplaintByIdAndCompanyId,
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

const getComplaints = async (companyId, filters = {}) => {
  const complaints = await getComplaintsByCompanyId(companyId, filters);

  return complaints.map((complaint) => ({
    ...complaint,
    tat: formatTat(complaint.tatMinutes),
  }));
};

const getComplaintDetails = async (complaintId, companyId) => {
  const complaint = await getComplaintByIdAndCompanyId(complaintId, companyId);

  if (!complaint) {
    return null;
  }

  return {
    ...complaint,
    tat: formatTat(complaint.tatMinutes),
  };
};
export { getComplaints, getComplaintDetails};
