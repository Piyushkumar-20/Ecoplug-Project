import db from "../config/db.js";

const createCompanyAccount = async (companyId, connection = db) => {
  const [result] = await connection.query(
    `INSERT INTO company_accounts (company_id) VALUE(?)`[companyId],
  );

  return result;
};

export {createCompanyAccount}