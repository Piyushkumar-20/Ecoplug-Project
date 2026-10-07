import bcrypt from "bcryptjs";
import {
  createUser,
  getUsersByCompanyId,
} from "../models/user.model.js";

const registerUser = async ({ companyId, name, email, password }) => {
  const passwordHash = await bcrypt.hash(password, 10);

  return createUser(companyId, name, email, passwordHash, "EMPLOYEE");
};

const listUsers = async (companyId) => {
  return getUsersByCompanyId(companyId);
};

export { registerUser, listUsers };
