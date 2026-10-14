import { getChargersByCompanyId } from "../models/chargers.model.js";

const CONNECTOR_LABELS = {
  IEC_62196_T2_COMBO: "CCS2",
  IEC_62196_T2: "Type 2",
  CHADEMO: "CHAdeMO",
};

const CONNECTOR_FILTERS = {
  CCS2: "IEC_62196_T2_COMBO",
  "TYPE 2": "IEC_62196_T2",
  CHADEMO: "CHADEMO",
};

const getDisplayConnectorType = (connectorType) => {
  if (!connectorType) return "—";

  return String(connectorType)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => CONNECTOR_LABELS[value] ?? value.replaceAll("_", " "))
    .join(" / ");
};

const getDisplayStatus = (status) => {
  const normalized = String(status ?? "")
    .trim()
    .toUpperCase();

  const labels = {
    AVAILABLE: "Available",
    CHARGING: "Charging",
    INOPERATIVE: "Offline",
    UNKNOWN: "Offline",
    OFFLINE: "Offline",
    PREPARING: "Preparing",
    SUSPENDED_EV: "Suspended",
    SUSPENDED_EVSE: "Suspended",
    FINISHING: "Finishing",
    RESERVED: "Reserved",
    FAULTED: "Faulted",
  };

  return (
    labels[normalized] ??
    (normalized
      ? normalized.charAt(0) + normalized.slice(1).toLowerCase()
      : "Unknown")
  );
};

const getDisplayChargerId = (charger) => {
  const locationMatch = /^LOC-(\d+)$/i.exec(String(charger.locationId ?? ""));

  const evseMatch = /(?:\*|[-])(\d+)$/.exec(String(charger.chargerId ?? ""));

  if (locationMatch && evseMatch) {
    const locationNumber = Number(locationMatch[1]);
    const evseNumber = Number(evseMatch[1]);

    if (
      locationNumber >= 201 &&
      locationNumber <= 9999 &&
      evseNumber >= 1 &&
      evseNumber <= 4
    ) {
      const displayNumber = 9900 + (locationNumber - 201) * 4 + evseNumber;

      return `CHG-${displayNumber}`;
    }
  }

  const uuidSuffix = String(charger.id ?? "")
    .replaceAll("-", "")
    .slice(-8)
    .toUpperCase();

  return `CHG-${uuidSuffix || "UNKNOWN"}`;
};

const formatPowerOutput = (powerKW) => {
  if (!Number.isFinite(powerKW)) return "—";

  return `${Number(powerKW.toFixed(2))} kW`;
};

const getChargers = async (companyId, filters = {}) => {
  const normalizedFilters = { ...filters };

  // Convert dashboard connector labels to database standards.
  if (normalizedFilters.connectorType) {
    const key = String(normalizedFilters.connectorType).trim().toUpperCase();

    normalizedFilters.connectorType =
      CONNECTOR_FILTERS[key] ?? normalizedFilters.connectorType;
  }

  // Support Last N Days filtering.
  if (normalizedFilters.lastActiveDays !== undefined) {
    const days = Number(normalizedFilters.lastActiveDays);

    if (!Number.isInteger(days) || days < 1 || days > 3650) {
      throw new Error("lastActiveDays must be between 1 and 3650");
    }

    const from = new Date();
    from.setDate(from.getDate() - days);

    normalizedFilters.lastActiveFrom = from.toISOString().slice(0, 10);
  }

  // Fetch chargers using SQL filters.
  const chargers = await getChargersByCompanyId(companyId, normalizedFilters);

  // Format database records for the dashboard.
  let result = chargers.map((charger) => {
    const maxOutputKW = Number(charger.maxOutputWatts) / 1000;

    return {
      id: charger.id,
      chargerId: charger.chargerId,
      displayChargerId: getDisplayChargerId(charger),
      locationId: charger.locationId,
      locationName: charger.locationName,
      city: charger.city,
      connectorType: charger.connectorType,
      displayConnectorType: getDisplayConnectorType(charger.connectorType),
      maxOutputKW,
      formattedMaxOutput: formatPowerOutput(maxOutputKW),
      lastActive: charger.lastActive,
      status: charger.status,
      displayStatus: getDisplayStatus(charger.status),
      emsp: charger.emsp,
      hardwareModel: charger.hardwareModel,
    };
  });

  // Search by generated charger ID, EVSE ID, model, location or eMSP.
  if (filters.search?.trim()) {
    const search = filters.search.trim().toLowerCase();

    result = result.filter((charger) =>
      [
        charger.displayChargerId,
        charger.chargerId,
        charger.hardwareModel,
        charger.locationName,
        charger.emsp,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(search),
      ),
    );
  }

  return result;
};

export { getChargers };
