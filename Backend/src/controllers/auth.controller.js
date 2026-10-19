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

const setRefreshCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);
};

const handleError = (res, error, fallbackMessage) => {
  const status = error.statusCode || 500;

  if (status >= 500) {
    console.error(fallbackMessage, error);
  }

  return res.status(status).json({
    success: false,
    message: status >= 500 ? fallbackMessage : error.message,
  });
};

const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    setRefreshCookie(res, result.refreshToken);

    const { refreshToken, ...responseData } = result;

    return ApiResponse.ok(res, "Login successful", responseData);
  } catch (error) {
    return handleError(res, error, "Login failed");
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      throw ApiError.unauthorized("Refresh token is Required");
    }
    const result = await refreshAccessToken(refreshToken);

    setRefreshCookie(res, result.refreshToken);

    return ApiResponse.ok(res, "Token refreshed successfully", {
      token: result.token,
    });
  } catch (error) {
    clearRefreshCookie(res);
    return handleError(res, error, "Token refresh failed");
  }
};

const me = async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.userId);

    return ApiResponse.ok(res, "User fetched successfully", user);
  } catch (error) {
    return handleError(res, error, "Failed to fetch user");
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    clearRefreshCookie(res);

    return ApiResponse.ok(res, "Logout successful");
  } catch (error) {
    return handleError(res, error, "Logout failed");
  }
};

export { login, refresh, me, logout };
