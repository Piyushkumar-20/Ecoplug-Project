import db from "../config/db.js";

const getDashboardByCompanyId = async (companyId) => {
  if (companyId === undefined || companyId === null || companyId === "") {
    throw new Error("Company ID is required");
  }

  const [
    [locationRows],
    [chargerRows],
    [chargerStatusRows],
    [sessionSummaryRows],
    [sessionStatusRows],
    [revenueRows],
    [recentSessionRows],
    [dailyActivityRows],
  ] = await Promise.all([
    // 1. Total locations
    db.query(
      `SELECT COUNT(*) AS totalLocations
       FROM ocpi_roaming_locations
       WHERE company_id = ?`,
      [companyId],
    ),

    // 2. Total chargers
    db.query(
      `SELECT COUNT(DISTINCT e.uid) AS totalChargers
       FROM ocpi_roaming_evses e
       INNER JOIN ocpi_roaming_locations l
         ON l.id = e.location_id
       WHERE l.company_id = ?`,
      [companyId],
    ),

    // 3. Charger status breakdown
    db.query(
      `SELECT
         UPPER(
           COALESCE(NULLIF(TRIM(e.status), ''), 'UNKNOWN')
         ) AS status,
         COUNT(DISTINCT e.uid) AS count
       FROM ocpi_roaming_evses e
       INNER JOIN ocpi_roaming_locations l
         ON l.id = e.location_id
       WHERE l.company_id = ?
       GROUP BY UPPER(
         COALESCE(NULLIF(TRIM(e.status), ''), 'UNKNOWN')
       )
       ORDER BY count DESC`,
      [companyId],
    ),

    // 4. Total sessions and energy
    db.query(
      `SELECT
         COUNT(*) AS totalSessions,
         COALESCE(SUM(COALESCE(s.kwh, 0)), 0) AS energyKwh
       FROM ocpi_sessions s
       WHERE s.company_id = ?`,
      [companyId],
    ),

    // 5. Session status breakdown
    db.query(
      `SELECT
         UPPER(
           COALESCE(NULLIF(TRIM(s.status), ''), 'UNKNOWN')
         ) AS status,
         COUNT(*) AS count
       FROM ocpi_sessions s
       WHERE s.company_id = ?
       GROUP BY UPPER(
         COALESCE(NULLIF(TRIM(s.status), ''), 'UNKNOWN')
       )
       ORDER BY count DESC`,
      [companyId],
    ),

    // 6. Revenue grouped by currency
    db.query(
      `SELECT
         COALESCE(
           NULLIF(TRIM(s.currency), ''),
           'UNKNOWN'
         ) AS currency,
         COALESCE(SUM(COALESCE(s.total_cost, 0)), 0) AS amount
       FROM ocpi_sessions s
       WHERE s.company_id = ?
       GROUP BY COALESCE(
         NULLIF(TRIM(s.currency), ''),
         'UNKNOWN'
       )
       ORDER BY currency ASC`,
      [companyId],
    ),

    // 7. Five most recent sessions
    db.query(
      `SELECT
         s.session_id AS sessionId,
         l.name AS stationName,
         l.city,
         e.evse_id AS chargerId,
         s.start_date_time AS startedAt,
         s.end_date_time AS endedAt,
         s.kwh AS energyKwh,
         s.total_cost AS billingAmount,
         s.currency,
         s.status
       FROM ocpi_sessions s
       LEFT JOIN ocpi_roaming_locations l
         ON l.id = s.location_id
        AND l.company_id = s.company_id
       LEFT JOIN ocpi_roaming_evses e
         ON e.uid = s.evse_uid
        AND e.location_id = l.id
       WHERE s.company_id = ?
       ORDER BY s.start_date_time DESC, s.id DESC
       LIMIT 5`,
      [companyId],
    ),

    db.query(
      `SELECT
         DATE_FORMAT(s.start_date_time, '%Y-%m-%d') AS day,
         COUNT(*) AS sessions,
         COALESCE(SUM(COALESCE(s.kwh, 0)), 0) AS energyKwh,
         COALESCE(
           SUM(
             CASE
               WHEN s.currency = 'INR'
               THEN COALESCE(s.total_cost, 0)
               ELSE 0
             END
           ),
           0
         ) AS revenue
       FROM ocpi_sessions s
       WHERE s.company_id = ?
         AND s.start_date_time >= DATE_SUB(
           CURDATE(),
           INTERVAL 29 DAY
         )
         AND s.start_date_time < DATE_ADD(
           CURDATE(),
           INTERVAL 1 DAY
         )
       GROUP BY DATE_FORMAT(s.start_date_time, '%Y-%m-%d')
       ORDER BY day ASC`,
      [companyId],
    ),
  ]);

  const number = (value) => Number(value ?? 0);

  return {
    summary: {
      totalLocations: number(locationRows[0]?.totalLocations),
      totalChargers: number(chargerRows[0]?.totalChargers),
      totalSessions: number(sessionSummaryRows[0]?.totalSessions),
      energyKwh: number(sessionSummaryRows[0]?.energyKwh),
    },

    chargerStatus: chargerStatusRows.map((row) => ({
      status: row.status,
      count: number(row.count),
    })),

    sessionStatus: sessionStatusRows.map((row) => ({
      status: row.status,
      count: number(row.count),
    })),

    revenueByCurrency: revenueRows.map((row) => ({
      currency: row.currency,
      amount: number(row.amount),
    })),

    recentSessions: recentSessionRows.map((row) => ({
      ...row,
      energyKwh: row.energyKwh == null ? null : number(row.energyKwh),
      billingAmount:
        row.billingAmount == null ? null : number(row.billingAmount),
    })),

    dailyActivity: dailyActivityRows.map((row) => ({
      day: String(row.day).slice(0, 10),
      sessions: number(row.sessions),
      energyKwh: number(row.energyKwh),
      revenue: number(row.revenue),
    })),
  };
};

export { getDashboardByCompanyId };
