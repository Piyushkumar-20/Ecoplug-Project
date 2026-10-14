import db from "../config/db.js";

const getChargersByCompanyId = async (companyId, filters = {}) => {
  const conditions = ["l.company_id = ?"];
  const params = [companyId];

  if (filters.emsp) {
    conditions.push("e.emsp LIKE ?");
    params.push(`%${filters.emsp}%`);
  }

  if (filters.locationId) {
    conditions.push("(l.id = ? OR l.name LIKE ?)");
    params.push(filters.locationId, `%${filters.locationId}%`);
  }

  if (filters.connectorType) {
    conditions.push("c.standard = ?");
    params.push(filters.connectorType);
  }

  if (filters.status) {
    conditions.push("UPPER(e.status) = ?");
    params.push(filters.status.toUpperCase());
  }

  if (filters.minOutput !== undefined) {
    conditions.push("COALESCE(c.max_electric_power, 0) >= ?");
    params.push(filters.minOutput * 1000);
  }

  if (filters.maxOutput !== undefined) {
    conditions.push("COALESCE(c.max_electric_power, 0) <= ?");
    params.push(filters.maxOutput * 1000);
  }

  if (filters.lastActiveFrom) {
    conditions.push("e.last_updated >= ?");
    params.push(filters.lastActiveFrom);
  }

  if (filters.lastActiveTo) {
    conditions.push("e.last_updated < DATE_ADD(?, INTERVAL 1 DAY)");
    params.push(filters.lastActiveTo);
  }

  const [rows] = await db.query(
    `
    SELECT
      e.uid AS id,
      e.evse_id AS chargerId,
      e.status,
      e.last_updated AS lastActive,
      l.id AS locationId,
      l.name AS locationName,
      l.city,
      GROUP_CONCAT(
        DISTINCT c.standard
        ORDER BY c.standard
        SEPARATOR ', '
      ) AS connectorType,
      COALESCE(MAX(c.max_electric_power), 0) AS maxOutputWatts,
      e.emsp AS emsp,
      e.hardware_model AS hardwareModel
    FROM ocpi_roaming_evses AS e
    INNER JOIN ocpi_roaming_locations AS l
      ON l.id = e.location_id
    LEFT JOIN ocpi_roaming_connectors AS c
      ON c.evse_uid = e.uid
    WHERE ${conditions.join(" AND ")}
    GROUP BY
      e.uid,
      e.evse_id,
      e.status,
      e.last_updated,
      l.id,
      l.name,
      l.city,
      e.emsp,
      e.hardware_model
    ORDER BY e.last_updated DESC, e.uid ASC
    `,
    params,
  );

  return rows;
};

export { getChargersByCompanyId };
