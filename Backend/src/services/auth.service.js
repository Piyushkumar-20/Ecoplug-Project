import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, findUserById } from "../models/user.model.js";

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      userId: user.id,
      companyId: user.company_id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = createToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      companyId: user.company_id,
      role: user.role,
    },
  };
};

const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    companyId: user.company_id,
    role: user.role,
  };
};

export { loginUser, getCurrentUser };
