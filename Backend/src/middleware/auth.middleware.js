import jwt from "jsonwebtoken";
import ApiError from "../utils/api-error.js";
import { rateLimit } from "express-rate-limit"; 

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Authentication required"));
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return next(ApiError.unauthorized("Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId || !decoded.companyId || !decoded.role) {
      return next(
        ApiError.unauthorized(
          "Authentication required. Invalid Authentication Token!",
        ),
      );
    }

    req.user = {
      userId: decoded.userId,
      companyId: decoded.companyId,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        ApiError.unauthorized("Session expired. Please log in again."),
      );
    }

    if (error.name === "JsonWebTokenError") {
      return next(ApiError.unauthorized("Authentication failed"));
    }
    return next(error);
  }
};

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,

  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes.",
  },
});

export { authMiddleware, authRateLimiter };
