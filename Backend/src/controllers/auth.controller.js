import {
  getCurrentUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "../services/auth.service.js";

import ApiResponse from "../utils/api-response.js";
import ApiError from "../utils/api-error.js";

const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 7);
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth",
};

// Set refresh token cookie
const setRefreshCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  });
};

// Clear refresh token cookie
const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);
};

// Login
const login = async (req, res) => {
  const result = await loginUser(req.body);
  setRefreshCookie(res, result.refreshToken);
  const { refreshToken, ...responseData } = result;
  return ApiResponse.ok(res, "Login successful", responseData);
};

// Refresh access token
const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      throw ApiError.unauthorized("Refresh token is required");
    }
    const result = await refreshAccessToken(refreshToken);
    setRefreshCookie(res, result.refreshToken);

    return ApiResponse.ok(res, "Token refreshed successfully", {
      token: result.token,
    });
  } catch (error) {
    clearRefreshCookie(res);
    return next(error);
  }
};

// Get current user
const me = async (req, res) => {
  const user = await getCurrentUser(req.user.userId);
  return ApiResponse.ok(res, "User fetched successfully", user);
};

// Logout
const logout = async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (refreshToken) {
    await logoutUser(refreshToken);
  }
  clearRefreshCookie(res);
  return ApiResponse.ok(res, "Logout successful");
};

export { login, refresh, me, logout };
