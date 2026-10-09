import bcrypt from "bcryptjs";
import db from "../config/db.js";
import {
  createCompany,
  getProfileByUserId,
} from "../models/companies.model.js";
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
      connection,
    );

    const companyId = companyResult.insertId;
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const adminResult = await createUser(
      companyId,
      adminName,
      adminEmail,
      passwordHash,
      "ADMIN",
      connection,
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

const getProfile = async (userId, companyId) => {
  const profile = await getProfileByUserId(userId, companyId);

  if (!profile) {
    const error = new Error("Profile not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    user: {
      id: profile.user_id,
      name: profile.user_name,
      email: profile.user_email,
      role: profile.user_role,
    },

    company: {
      id: profile.company_id,
      name: profile.company_name,
      partyId: profile.party_id,
      role: profile.company_role,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      pin: profile.pin,
      gstin: profile.gstin,
      cin: profile.cin,
      pan: profile.pan,
    },

    admin: {
      name: profile.admin_name,
      mobile: profile.admin_mobile,
      email: profile.admin_email,
    },
  };
};

export { registerCompany, getProfile };
