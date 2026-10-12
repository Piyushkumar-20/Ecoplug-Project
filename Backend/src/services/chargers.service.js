import { getChargersByCompanyId } from "../models/chargers.model.js";

const CONNECTOR_LABELS = {
  IEC_62196_T2_COMBO: "CCS2",
  IEC_62196_T2: "Type 2",
  CHADEMO: "CHAdeMO",
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

const getChargers = async (companyId) => {
  const chargers = await getChargersByCompanyId(companyId);

  return chargers.map((charger) => {
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
};

export { getChargers };
