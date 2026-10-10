import db from "../config/db.js";

const getSessionsByCompanyId = async (
  companyId,
  { page = 1, limit = 25, status, search } = {},
) => {
  const conditions = ["s.company_id = ?"];
  const params = [companyId];

  if (status) {
    conditions.push("s.status = ?");
    params.push(status);
  }

  if (search) {
    conditions.push(`
      (
        s.session_id LIKE ?
        OR l.name LIKE ?
        OR l.city LIKE ?
        OR e.evse_id LIKE ?
      )
    `);

    const searchTerm = `%${search}%`;

    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  const whereClause = conditions.join(" AND ");

  const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const parsedLimit = Math.min(
    100,
    Math.max(1, Number.parseInt(limit, 10) || 25),
  );

  const offset = (parsedPage - 1) * parsedLimit;

  const [rows] = await db.query(
    `
    SELECT
      s.id,
      s.session_id AS sessionId,
      s.cdr_id AS cdrId,
      s.company_id AS companyId,

      l.id AS locationId,
      l.name AS stationName,
      l.city,

      e.uid AS evseUid,
      e.evse_id AS chargerId,
      e.emsp AS emspPartner,

      s.connector_id AS connectorId,
      s.start_date_time AS startedAt,
      s.end_date_time AS endedAt,
      s.kwh AS energyKwh,
      s.total_cost AS billingAmount,
      s.currency,
      s.status,
      s.last_updated AS lastUpdated,

      CASE
        WHEN s.end_date_time IS NOT NULL THEN
          TIMESTAMPDIFF(
            MINUTE,
            s.start_date_time,
            s.end_date_time
          )
        ELSE
          TIMESTAMPDIFF(
            MINUTE,
            s.start_date_time,
            NOW()
          )
      END AS durationMinutes

    FROM ocpi_sessions AS s

    LEFT JOIN ocpi_roaming_locations AS l
      ON l.id = s.location_id
      AND l.company_id = s.company_id

    LEFT JOIN ocpi_roaming_evses AS e
      ON e.uid = s.evse_uid
      AND e.location_id = l.id

    WHERE ${whereClause}

    ORDER BY s.start_date_time DESC, s.id DESC
    LIMIT ? OFFSET ?
    `,
    [...params, parsedLimit, offset],
  );

  const [countRows] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM ocpi_sessions AS s

    LEFT JOIN ocpi_roaming_locations AS l
      ON l.id = s.location_id
      AND l.company_id = s.company_id

    LEFT JOIN ocpi_roaming_evses AS e
      ON e.uid = s.evse_uid
      AND e.location_id = l.id

    WHERE ${whereClause}
    `,
    params,
  );

  const total = Number(countRows[0].total);

  return {
    sessions: rows,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit),
    },
  };
};

const getSessionById = async (sessionId, companyId) => {
  const [rows] = await db.query(
    `
    SELECT
      s.id,
      s.session_id AS sessionId,
      s.cdr_id AS cdrId,
      s.company_id AS companyId,

      l.id AS locationId,
      l.name AS stationName,
      l.city,

      e.uid AS evseUid,
      e.evse_id AS chargerId,
      e.emsp AS emspPartner,

      s.connector_id AS connectorId,
      s.start_date_time AS startedAt,
      s.end_date_time AS endedAt,
      s.kwh AS energyKwh,
      s.total_cost AS billingAmount,
      s.currency,
      s.status,
      s.last_updated AS lastUpdated,

      CASE
        WHEN s.end_date_time IS NOT NULL THEN
          TIMESTAMPDIFF(
            MINUTE,
            s.start_date_time,
            s.end_date_time
          )
        ELSE
          TIMESTAMPDIFF(
            MINUTE,
            s.start_date_time,
            NOW()
          )
      END AS durationMinutes

    FROM ocpi_sessions AS s

    LEFT JOIN ocpi_roaming_locations AS l
      ON l.id = s.location_id
      AND l.company_id = s.company_id

    LEFT JOIN ocpi_roaming_evses AS e
      ON e.uid = s.evse_uid
      AND e.location_id = l.id

    WHERE s.session_id = ?
      AND s.company_id = ?

    LIMIT 1
    `,
    [sessionId, companyId],
  );

  return rows[0] ?? null;
};

export { getSessionsByCompanyId, getSessionById };
