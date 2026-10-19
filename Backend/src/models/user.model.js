import db from "../config/db.js";
import bcrypt from "bcryptjs";

const createUser = async (
  companyId,
  name,
  email,
  passwordHash,
  role = "EMPLOYEE",
  connection = db,
) => {
  const [result] = await connection.query(
    `INSERT INTO company_users
      (company_id, name, email, password_hash, role)
     VALUES (?, ?, ?, ?, ?)`,
    [companyId, name, email, passwordHash, role],
  );

  return result;
};

const findUserByEmail = async (email) => {
  const [rows] = await db.query(
    `SELECT id, company_id, name, email, password_hash, role, created_at, updated_at
     FROM company_users
     WHERE email = ?
     LIMIT 1`,
    [email],
  );

  return rows[0] ?? null;
};

const findUserById = async (id) => {
  const [rows] = await db.query(
    `SELECT id, company_id, name, email, role, created_at, updated_at
     FROM company_users
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return rows[0] ?? null;
};

const getUsersByCompanyId = async (companyId) => {
  const [rows] = await db.query(
    `SELECT id, company_id, name, email, role, created_at, updated_at
     FROM company_users
     WHERE company_id = ?
     ORDER BY id DESC`,
    [companyId],
  );

  return rows;
};

const createAuthSession = async (userId, refreshTokenHash, expiresAt) => {
  const sql = `
    INSERT INTO auth_sessions (
      user_id,
      refresh_token_hash,
      expires_at
    )
    VALUES (?, ?, ?)
  `;

  const [result] = await db.query(sql, [userId, refreshTokenHash, expiresAt]);

  return result.insertId;
};

const findAuthSessionById = async (sessionId) => {
  const sql = `
    SELECT
      id,
      user_id,
      refresh_token_hash,
      expires_at,
      last_used_at,
      revoked_at
    FROM auth_sessions
    WHERE id = ?
    LIMIT 1
  `;

  const [rows] = await db.query(sql, [sessionId]);

  return rows.length > 0 ? rows[0] : null;
};

const revokeAuthSession = async (sessionId) => {
  const sql = `
    UPDATE auth_sessions
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND revoked_at IS NULL
  `;

  const [result] = await db.query(sql, [sessionId]);

  return result.affectedRows > 0;
};

const updateAuthSessionLastUsed = async (sessionId) => {
  const sql = `
    UPDATE auth_sessions
    SET last_used_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND revoked_at IS NULL
  `;

  const [result] = await db.query(sql, [sessionId]);

  return result.affectedRows > 0;
};

const rotateAuthSession = async (
  sessionId,
  currentHash,
  newHash,
  expiresAt,
) => {
  const sql = `
    UPDATE auth_sessions
    SET
      refresh_token_hash = ?,
      expires_at = ?,
      last_used_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND refresh_token_hash = ?
      AND revoked_at IS NULL
      AND expires_at > CURRENT_TIMESTAMP
      AND created_at > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 DAY)
  `;

  const [result] = await db.query(sql, [
    newHash,
    expiresAt,
    sessionId,
    currentHash,
  ]);

  return result.affectedRows === 1;
};

export {
  createUser,
  findUserByEmail,
  findUserById,
  getUsersByCompanyId,
  createAuthSession,
  revokeAuthSession,
  rotateAuthSession,
  findAuthSessionById,
  updateAuthSessionLastUsed,
};
