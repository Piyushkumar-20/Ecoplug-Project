import db from "../config/db.js";

const createCompany = async (name) => {
  const [result] = await db.query(
    `INSERT INTO companies (name) VALUES (?)`,
    [name]
  );

  return result;
};

export { createCompany };