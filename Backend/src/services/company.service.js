import bcrypt from "bcryptjs";
import db from "../config/db.js";
import { createCompany } from "../models/companies.model.js";
import { createUser } from "../models/user.model.js";

const registerCompany = async ({
  name,
  adminName,
  adminEmail,
  adminPassword,
}) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const companyResult = await createCompany(
      { name, adminName, adminEmail },
      connection
    );

    const companyId = companyResult.insertId;
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const adminResult = await createUser(
      companyId,
      adminName,
      adminEmail,
      passwordHash,
      "ADMIN",
      connection
    );

    await connection.commit();

    return {
      companyId,
      adminUserId: adminResult.insertId,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export { registerCompany };
