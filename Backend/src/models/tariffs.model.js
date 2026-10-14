
import db from "../config/db.js";

const getAllTariffs = async (companyId, filters = {}) => {
  const conditions = ["company_id = ?"];
  const params = [companyId];

  if (filters.search) {
    conditions.push(
      "(tariff_id LIKE ? OR CONCAT('#TRF-', LPAD(id + 100, 4, '0')) LIKE ?)"
    );

    const searchValue = `%${filters.search.trim()}%`;
    params.push(searchValue, searchValue);
  }

  if (filters.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }

  if (filters.validityWindow) {
    conditions.push("validity_label = ?");
    params.push(filters.validityWindow);
  }

  if (filters.createdFrom) {
    conditions.push("created_at >= ?");
    params.push(filters.createdFrom);
  }

  if (filters.createdTo) {
    conditions.push("created_at < DATE_ADD(?, INTERVAL 1 DAY)");
    params.push(filters.createdTo);
  }

  const sql = `
    SELECT
      id,
      tariff_id,
      company_id,
      country_code,
      party_id,
      currency,
      type,
      elements,
      created_at,
      status,
      validity_label
    FROM ocpi_tariffs
    WHERE ${conditions.join(" AND ")}
    ORDER BY id DESC
  `;

  const [rows] = await db.query(sql, params);
  return rows;
};

export { getAllTariffs };
