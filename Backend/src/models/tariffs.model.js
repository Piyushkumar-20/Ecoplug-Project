import db from "../config/db.js";

const getAllTariffs = async () => {
  const [rows] = await db.query(
    `SELECT
       id,
       tariff_id,
       company_id,
       country_code,
       party_id,
       currency,
       type,
       elements,
       created_at
     FROM ocpi_tariffs
     ORDER BY id DESC`,
  );

  return rows;
};

export { getAllTariffs };
