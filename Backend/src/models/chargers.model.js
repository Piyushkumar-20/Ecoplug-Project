import db from "../config/db.js";

const getChargersByCompanyId = async (companyId) => {
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
      COALESCE(MAX(c.max_electric_power), 0) AS maxOutputWatts
    FROM ocpi_roaming_evses AS e
    INNER JOIN ocpi_roaming_locations AS l
      ON l.id = e.location_id
    LEFT JOIN ocpi_roaming_connectors AS c
      ON c.evse_uid = e.uid
    WHERE l.company_id = ?
    GROUP BY
      e.uid,
      e.evse_id,
      e.status,
      e.last_updated,
      l.id,
      l.name,
      l.city
    ORDER BY e.last_updated DESC, e.uid ASC
    `,
    [companyId],
  );

  return rows;
};

export { getChargersByCompanyId };
