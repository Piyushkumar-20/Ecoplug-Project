import db from "../config/db.js";

const createUser = async (
  companyId,
  name,
  email,
  passwordHash,
  role = "EMPLOYEE",
  connection = db
) => {
  const [result] = await connection.query(
    `INSERT INTO company_users
      (company_id, name, email, password_hash, role)
     VALUES (?, ?, ?, ?, ?)`,
    [companyId, name, email, passwordHash, role]
  );

  return result;
};

const findUserByEmail = async (email) => {
  const [rows] = await db.query(
    `SELECT id, company_id, name, email, password_hash, role, created_at, updated_at
     FROM company_users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  return rows[0] ?? null;
};

const findUserById = async (id) => {
  const [rows] = await db.query(
    `SELECT id, company_id, name, email, role, created_at, updated_at
     FROM company_users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
};

const getUsersByCompanyId = async (companyId) => {
  const [rows] = await db.query(
    `SELECT id, company_id, name, email, role, created_at, updated_at
     FROM company_users
     WHERE company_id = ?
     ORDER BY id DESC`,
    [companyId]
  );

  return rows;
};

export {
  createUser,
  findUserByEmail,
  findUserById,
  getUsersByCompanyId,
};
