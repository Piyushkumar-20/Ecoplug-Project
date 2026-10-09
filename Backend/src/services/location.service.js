
import { getLocationsByCompanyId } from "../models/location.model.js";

const getLocationStatus = (evseStatuses) => {
  const statuses = String(evseStatuses ?? "")
    .split(",")
    .filter(Boolean);

  if (statuses.length === 0) {
    return "Offline";
  }

  const availableCount = statuses.filter(
    (status) => status === "AVAILABLE"
  ).length;

  const inoperativeCount = statuses.filter(
    (status) => status === "INOPERATIVE"
  ).length;

  // Every charger is available
  if (availableCount === statuses.length) {
    return "Online";
  }

  // Every charger is inoperative
  if (inoperativeCount === statuses.length) {
    return "Maintenance";
  }

  // Some chargers are available, but not all
  if (availableCount > 0) {
    return "Partial";
  }

  // No available chargers; remaining statuses may be UNKNOWN
  return "Offline";
};

const getLocations = async (companyId) => {
  const locations = await getLocationsByCompanyId(companyId);

  return locations.map((location) => ({
    id: location.id,
    name: location.name,
    city: location.city,
    address: location.address,
    addedDate: location.last_updated,
    chargers: Number(location.chargers),
    powerOutputKW: Number(location.total_power_watts) / 1000,
    status: getLocationStatus(location.evse_statuses),
  }));
};

export { getLocations };
