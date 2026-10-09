import { getChargersByCompanyId } from "../models/chargers.model.js";

const getChargers = async (companyId) => {
  const chargers = await getChargersByCompanyId(companyId);

  return chargers.map((charger) => ({
    id: charger.id,
    chargerId: charger.chargerId,
    locationName: charger.locationName,
    city: charger.city,
    connectorType: charger.connectorType,
    maxOutputKW: Number(charger.maxOutputWatts) / 1000,
    lastActive: charger.lastActive,
    status: charger.status,
  }));
};

export {getChargers}