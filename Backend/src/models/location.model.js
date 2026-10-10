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
      GROUP_CONCAT(DISTINCT UPPER(TRIM(e.status))) AS evse_statuses,

      (
        SELECT c.max_electric_power
        FROM ocpi_roaming_evses e2
        INNER JOIN ocpi_roaming_connectors c
          ON c.evse_uid = e2.uid
        WHERE e2.location_id = l.id
          AND c.max_electric_power IS NOT NULL
        ORDER BY
          c.max_electric_power DESC,
          c.evse_uid ASC
        LIMIT 1
      ) AS max_power_watts,

      (
        SELECT c.power_type
        FROM ocpi_roaming_evses e2
        INNER JOIN ocpi_roaming_connectors c
          ON c.evse_uid = e2.uid
        WHERE e2.location_id = l.id
          AND c.max_electric_power IS NOT NULL
        ORDER BY
          c.max_electric_power DESC,
          c.evse_uid ASC
        LIMIT 1
      ) AS power_type

    FROM ocpi_roaming_locations l

    LEFT JOIN ocpi_roaming_evses e
      ON e.location_id = l.id

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
