import bcrypt from "bcryptjs";
import { createUser } from "../models/user.model.js";

const registerUser = async ({ companyId, name, email, password }) => {
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await createUser(companyId, name, email, passwordHash);

  return result;
};

export {registerUser}