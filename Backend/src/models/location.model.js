import db from "../config/db.js";

const getLocationsByCompanyId = async (companyId) => {
  const [rows] = await db.query(
    `
    SELECT
      l.id,
      l.company_id,
      l.name,
      l.city,
      l.address,
      l.last_updated,
      l.status,
      COUNT(DISTINCT e.uid) AS chargers,
      COALESCE(SUM(c.max_electric_power), 0) AS total_power_watts,
      GROUP_CONCAT(DISTINCT e.status) AS evse_statuses
    FROM ocpi_roaming_locations AS l
    LEFT JOIN ocpi_roaming_evses AS e
      ON e.location_id = l.id
    LEFT JOIN ocpi_roaming_connectors AS c
      ON c.evse_uid = e.uid
    WHERE l.company_id = ?
    GROUP BY
      l.id,
      l.company_id,
      l.name,
      l.city,
      l.address,
      l.last_updated,
      l.status
    ORDER BY l.last_updated DESC, l.id ASC
    `,
    [companyId],
  );

  return rows;
};

export { getLocationsByCompanyId };
