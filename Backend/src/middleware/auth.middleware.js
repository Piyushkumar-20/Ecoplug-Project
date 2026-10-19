import jwt from "jsonwebtoken";
import ApiError from "../utils/api-error.js";

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Authentication required");
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    throw ApiError.unauthorized("Authentication required");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId || !decoded.companyId || !decoded.role) {
      throw ApiError.unauthorized(
        "Authentication required. Invalid Authentication Token!",
      );
    }

    req.user = {
      userId: decoded.userId,
      companyId: decoded.companyId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Session expired. Please log in again.");
    }
  }
};

export { authMiddleware };
