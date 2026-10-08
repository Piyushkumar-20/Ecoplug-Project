import db from "../config/db.js";

const createCompany = async ({ name, adminName, adminEmail }, connection = db) => {
  const [result] = await connection.query(
    `INSERT INTO companies (name, admin_name, admin_email)
     VALUES (?, ?, ?)`,
    [name, adminName, adminEmail]
  );

  return result;
};

const findCompanyById = async (id) => {
  const [rows] = await db.query(
    `SELECT id, name, admin_name, admin_email, created_at, updated_at
     FROM companies
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
};

export { createCompany, findCompanyById };
