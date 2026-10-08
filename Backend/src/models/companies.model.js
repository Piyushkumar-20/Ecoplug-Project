import db from "../config/db.js";

const createCompany = async (
  { name, adminName, adminEmail },
  connection = db,
) => {
  const [result] = await connection.query(
    `INSERT INTO companies (name, admin_name, admin_email)
     VALUES (?, ?, ?)`,
    [name, adminName, adminEmail],
  );

  return result;
};

const findCompanyById = async (id) => {
  const [rows] = await db.query(
    `SELECT id, name, admin_name, admin_email, created_at, updated_at
     FROM companies
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return rows[0] ?? null;
};

const getProfileByUserId = async (userId, companyId) => {
  const [rows] = await db.query(
    `SELECT
       u.id AS user_id,
       u.name AS user_name,
       u.email AS user_email,
       u.role AS user_role,

       c.id AS company_id,
       c.name AS company_name,
       c.party_id,
       c.role AS company_role,
       c.address,
       c.city,
       c.state,
       c.pin,
       c.gstin,
       c.cin,
       c.pan,

       c.admin_name,
       c.admin_mobile,
       c.admin_email

     FROM company_users u
     INNER JOIN companies c
       ON c.id = u.company_id

     WHERE u.id = ?
       AND u.company_id = ?
     LIMIT 1`,
    [userId, companyId],
  );

  return rows[0] ?? null;
};

export { createCompany, findCompanyById, getProfileByUserId};
