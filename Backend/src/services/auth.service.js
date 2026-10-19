import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import ApiError from "../utils/api-error.js";

import {
  findUserByEmail,
  findUserById,
  createAuthSession,
  findAuthSessionById,
  revokeAuthSession,
  rotateAuthSession,
} from "../models/user.model.js";

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m"
const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 7);
const MAX_SESSION_DAYS = Number(process.env.MAX_SESSION_DAYS || 30);
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

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
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );
};

const createRefreshSecret = () => randomBytes(32).toString("hex");

const getExpiryDate = () => {
  return new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
};

const parseRefreshToken = (token) => {
  if (typeof token !== "string") return null;

  const separatorIndex = token.indexOf(".");

  if (separatorIndex < 1) return null;

  const sessionId = token.slice(0, separatorIndex);
  const secret = token.slice(separatorIndex + 1);

  if (!/^\d+$/.test(sessionId)) return null;
  if (!/^[a-f0-9]{64}$/.test(secret)) return null;

  return { sessionId, secret };
};


const createRefreshSession = async (userId) => {
  const secret = createRefreshSecret();
  const refreshTokenHash = await bcrypt.hash(secret, BCRYPT_ROUNDS);

  const expiresAt = getExpiryDate();

  const sessionId = await createAuthSession(
    userId,
    refreshTokenHash,
    expiresAt,
  );

  return `${sessionId}.${secret}`;
};


const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw ApiError.unauthorized("Invalid Email or Password");
  }

  const token = createToken(user);
  const refreshToken = await createRefreshSession(user.id);

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      companyId: user.company_id,
      role: user.role,
    },
  };
};

const refreshAccessToken = async (refreshToken) => {
  const parsed = parseRefreshToken(refreshToken);

  if (!parsed) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const session = await findAuthSessionById(parsed.sessionId);

  if (
    !session ||
    session.revoked_at ||
    new Date(session.expires_at).getTime() <= Date.now() ||
    new Date(session.created_at).getTime() <=
      Date.now() - MAX_SESSION_DAYS * 24 * 60 * 60 * 1000
  ) {
    throw ApiError.unauthorized("Refresh session expired or invalid");
  }

  const secretMatches = await bcrypt.compare(
    parsed.secret,
    session.refresh_token_hash,
  );

  if (!secretMatches) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const user = await findUserById(session.user_id);

  if (!user) {
    await revokeAuthSession(session.id);
    throw ApiError.notFound("User Not found");
  }

  const newSecret = createRefreshSecret();
  const newHash = await bcrypt.hash(newSecret, BCRYPT_ROUNDS);

  const rotated = await rotateAuthSession(
    session.id,
    session.refresh_token_hash,
    newHash,
    getExpiryDate(),
  );

  if (!rotated) {
    throw ApiError.unauthorized("Refresh token already used or expired");
  }

  return {
    token: createToken(user),
    refreshToken: `${session.id}.${newSecret}`,
  };
};

const logoutUser = async (refreshToken) => {
  const parsed = parseRefreshToken(refreshToken);

  if (!parsed) return;

  const session = await findAuthSessionById(parsed.sessionId);

  if (!session || session.revoked_at) return;

  const secretMatches = await bcrypt.compare(
    parsed.secret,
    session.refresh_token_hash,
  );

  if (secretMatches) {
    await revokeAuthSession(session.id);
  }
};

const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw ApiError.notFound("User Not Found")
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    companyId: user.company_id,
    role: user.role,
  };
};

export { loginUser, getCurrentUser, refreshAccessToken, logoutUser };
