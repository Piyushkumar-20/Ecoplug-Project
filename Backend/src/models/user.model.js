import db from "../config/db.js";

const createUser = async (companyId, name, email, passwordHash) => {
  const [result] = await db.query(
    `INSERT INTO company_users
      (company_id, name, email, password_hash)
     VALUES (?, ?, ?, ?)`,
    [companyId, name, email, passwordHash],
  );

  return result;
};

export { createUser };
