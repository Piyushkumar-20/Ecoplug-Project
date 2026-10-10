import { getLocationsByCompanyId } from "../models/location.model.js";

const getLocationStatus = (evseStatuses) => {
  const statuses = String(evseStatuses ?? "")
    .split(",")
    .map((status) => status.trim().toUpperCase())
    .filter(Boolean);

  if (statuses.length === 0) {
    return "Offline";
  }

  // All chargers are available
  if (statuses.every((status) => status === "AVAILABLE")) {
    return "Online";
  }

  // All chargers are inoperative
  if (statuses.every((status) => status === "INOPERATIVE")) {
    return "Maintenance";
  }

  // At least one charger is available, but not all
  if (statuses.includes("AVAILABLE")) {
    return "Partial";
  }

  // No available chargers
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
    powerOutputKW:
      location.max_power_watts == null
        ? null
        : Number(location.max_power_watts) / 1000,
    powerType: location.power_type,
    status: getLocationStatus(location.evse_statuses),
  }));
};

export { getLocations };
