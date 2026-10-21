import jwt from "jsonwebtoken";
import ApiError from "../utils/api-error.js";

const socketAuthMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      throw ApiError.unauthorized("Authentication Required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId || !decoded.companyId || !decoded.role) {
      throw ApiError.unauthorized(
        "Authentication required. Invalid Authentication Token!",
      );
    }

    socket.data.user = {
      userId: decoded.userId,
      companyId: decoded.companyId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(new Error("Invalid or expired authentication token"));
  }
};

export { socketAuthMiddleware };
